import {
  getPatents,
  getPatentById,
  createPatent,
  updatePatent,
  deletePatent,
} from '../../../src/controllers/patent.controller';
import { patentService } from '../../../src/services/patent.service';
import { prisma } from '../../../src/config/database';
import { mockRequest, mockResponse, jsonBody } from '../../helpers/express';
import { Request } from 'express';

jest.mock('../../../src/services/patent.service', () => ({
  patentService: {
    getPatents: jest.fn(),
    getPatentById: jest.fn(),
    createPatent: jest.fn(),
    updatePatent: jest.fn(),
    deletePatent: jest.fn(),
  },
}));

jest.mock('../../../src/config/database', () => ({
  prisma: { facultyProfile: { findUnique: jest.fn() } },
}));

const service = patentService as jest.Mocked<typeof patentService>;
const findProfile = prisma.facultyProfile.findUnique as jest.Mock;

const asUser = (role: 'ADMIN' | 'FACULTY', overrides: Partial<Request> = {}): Request =>
  mockRequest({
    user: { userId: 'user-1', sub: 'user-1', email: 'a@b.c', role },
    ...overrides,
  } as never);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getPatents', () => {
  it('defaults to page 1 with a limit of 10 and forwards the query as filters', async () => {
    service.getPatents.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const req = mockRequest();
    const res = mockResponse();

    await getPatents(req, res);

    expect(service.getPatents).toHaveBeenCalledWith(req.query, 1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toMatchObject({ success: true, data: [] });
  });

  it('parses page and limit from the query string', async () => {
    service.getPatents.mockResolvedValue({ data: [], meta: { total: 0, page: 3, limit: 50, totalPages: 0 } });
    const req = mockRequest({ query: { page: '3', limit: '50' } });

    await getPatents(req, mockResponse());

    expect(service.getPatents).toHaveBeenCalledWith(req.query, 3, 50);
  });
});

describe('getPatentById', () => {
  it('returns the patent when it exists', async () => {
    service.getPatentById.mockResolvedValue({ id: 'p1' } as never);
    const res = mockResponse();

    await getPatentById(mockRequest({ params: { id: 'p1' } }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toEqual({ success: true, data: { id: 'p1' } });
  });

  it('returns 404 when the patent is missing', async () => {
    service.getPatentById.mockResolvedValue(null);
    const res = mockResponse();

    await getPatentById(mockRequest({ params: { id: 'nope' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonBody(res)).toMatchObject({ success: false, message: 'Patent not found' });
  });
});

describe('createPatent', () => {
  it('lets an admin create a patent for an explicit faculty id', async () => {
    service.createPatent.mockResolvedValue({ id: 'p1' } as never);
    const req = asUser('ADMIN', { body: { facultyId: 'faculty-9', title: 'Widget' } });
    const res = mockResponse();

    await createPatent(req, res);

    expect(findProfile).not.toHaveBeenCalled();
    expect(service.createPatent).toHaveBeenCalledWith('faculty-9', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('ignores a faculty user\'s facultyId and uses their own profile', async () => {
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    service.createPatent.mockResolvedValue({ id: 'p1' } as never);
    const req = asUser('FACULTY', { body: { facultyId: 'faculty-9', title: 'Widget' } });

    await createPatent(req, mockResponse());

    expect(findProfile).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(service.createPatent).toHaveBeenCalledWith('faculty-1', req.body);
  });

  it('returns 400 when the user has no faculty profile', async () => {
    findProfile.mockResolvedValue(null);
    const res = mockResponse();

    await createPatent(asUser('FACULTY', { body: { title: 'Widget' } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonBody(res)).toMatchObject({ message: 'Faculty profile required' });
    expect(service.createPatent).not.toHaveBeenCalled();
  });
});

describe.each([
  ['updatePatent', updatePatent, 'updatePatent' as const],
  ['deletePatent', deletePatent, 'deletePatent' as const],
])('%s', (_name, handler, serviceMethod) => {
  it('returns 404 when the patent does not exist', async () => {
    service.getPatentById.mockResolvedValue(null);
    const res = mockResponse();

    await handler(asUser('FACULTY', { params: { id: 'p1' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(service[serviceMethod]).not.toHaveBeenCalled();
  });

  it('returns 403 when a faculty user does not own the patent', async () => {
    service.getPatentById.mockResolvedValue({ id: 'p1', facultyId: 'faculty-other' } as never);
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    const res = mockResponse();

    await handler(asUser('FACULTY', { params: { id: 'p1' } }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(jsonBody(res)).toMatchObject({ message: 'Forbidden' });
    expect(service[serviceMethod]).not.toHaveBeenCalled();
  });

  it('succeeds for the owning faculty user', async () => {
    service.getPatentById.mockResolvedValue({ id: 'p1', facultyId: 'faculty-1' } as never);
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    service.updatePatent.mockResolvedValue({ id: 'p1' } as never);
    service.deletePatent.mockResolvedValue({ id: 'p1' } as never);
    const res = mockResponse();

    await handler(asUser('FACULTY', { params: { id: 'p1' }, body: { title: 'New' } }), res);

    expect(service[serviceMethod]).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('succeeds for an admin who does not own the patent', async () => {
    service.getPatentById.mockResolvedValue({ id: 'p1', facultyId: 'faculty-other' } as never);
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    service.updatePatent.mockResolvedValue({ id: 'p1' } as never);
    service.deletePatent.mockResolvedValue({ id: 'p1' } as never);
    const res = mockResponse();

    await handler(asUser('ADMIN', { params: { id: 'p1' }, body: { title: 'New' } }), res);

    expect(service[serviceMethod]).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
