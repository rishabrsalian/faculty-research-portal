import { Request } from 'express';
import {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} from '../../../src/controllers/publication.controller';
import { publicationService } from '../../../src/services/publication.service';
import { prisma } from '../../../src/config/database';
import { mockRequest, mockResponse, jsonBody } from '../../helpers/express';

jest.mock('../../../src/services/publication.service', () => ({
  publicationService: {
    getPublications: jest.fn(),
    getPublicationById: jest.fn(),
    createPublication: jest.fn(),
    updatePublication: jest.fn(),
    deletePublication: jest.fn(),
  },
}));

jest.mock('../../../src/config/database', () => ({
  prisma: { facultyProfile: { findUnique: jest.fn() } },
}));

const service = publicationService as jest.Mocked<typeof publicationService>;
const findProfile = prisma.facultyProfile.findUnique as jest.Mock;

const asUser = (role: 'ADMIN' | 'FACULTY', overrides: Partial<Request> = {}): Request =>
  mockRequest({
    user: { userId: 'user-1', sub: 'user-1', email: 'a@b.c', role },
    ...overrides,
  } as never);

beforeEach(() => jest.clearAllMocks());

describe('getPublications', () => {
  it('spreads the service result and defaults pagination to page 1 / limit 10', async () => {
    service.getPublications.mockResolvedValue({
      data: [{ id: 'pub-1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    } as never);
    const req = mockRequest();
    const res = mockResponse();

    await getPublications(req, res);

    expect(service.getPublications).toHaveBeenCalledWith(req.query, 1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toMatchObject({
      success: true,
      data: [{ id: 'pub-1' }],
      meta: { total: 1 },
    });
  });

  it('parses page and limit and ignores non-numeric values', async () => {
    service.getPublications.mockResolvedValue({ data: [], meta: {} } as never);

    await getPublications(mockRequest({ query: { page: '4', limit: '25' } }), mockResponse());
    expect(service.getPublications).toHaveBeenLastCalledWith(expect.anything(), 4, 25);

    await getPublications(mockRequest({ query: { page: 'x', limit: 'y' } }), mockResponse());
    expect(service.getPublications).toHaveBeenLastCalledWith(expect.anything(), 1, 10);
  });
});

describe('getPublicationById', () => {
  it('returns 200 with the publication', async () => {
    service.getPublicationById.mockResolvedValue({ id: 'pub-1' } as never);
    const res = mockResponse();

    await getPublicationById(mockRequest({ params: { id: 'pub-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toEqual({ success: true, data: { id: 'pub-1' } });
  });

  it('returns 404 when missing', async () => {
    service.getPublicationById.mockResolvedValue(null);
    const res = mockResponse();

    await getPublicationById(mockRequest({ params: { id: 'nope' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonBody(res)).toMatchObject({ message: 'Publication not found' });
  });
});

describe('createPublication', () => {
  it('honours an explicit facultyId for an admin', async () => {
    service.createPublication.mockResolvedValue({ id: 'pub-1' } as never);
    const req = asUser('ADMIN', { body: { facultyId: 'faculty-9', title: 'Paper' } });
    const res = mockResponse();

    await createPublication(req, res);

    expect(findProfile).not.toHaveBeenCalled();
    expect(service.createPublication).toHaveBeenCalledWith('faculty-9', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('resolves the caller\'s own profile for a faculty user', async () => {
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    service.createPublication.mockResolvedValue({ id: 'pub-1' } as never);
    const req = asUser('FACULTY', { body: { facultyId: 'faculty-9', title: 'Paper' } });

    await createPublication(req, mockResponse());

    expect(findProfile).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(service.createPublication).toHaveBeenCalledWith('faculty-1', req.body);
  });

  it('returns 400 when the caller has no faculty profile', async () => {
    findProfile.mockResolvedValue(null);
    const res = mockResponse();

    await createPublication(asUser('FACULTY', { body: { title: 'Paper' } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonBody(res)).toMatchObject({
      message: 'Faculty profile required to create publication',
    });
    expect(service.createPublication).not.toHaveBeenCalled();
  });
});

describe.each([
  ['updatePublication', updatePublication, 'updatePublication' as const],
  ['deletePublication', deletePublication, 'deletePublication' as const],
])('%s', (_name, handler, serviceMethod) => {
  beforeEach(() => {
    service.updatePublication.mockResolvedValue({ id: 'pub-1' } as never);
    service.deletePublication.mockResolvedValue({ id: 'pub-1' } as never);
  });

  it('returns 404 for a missing publication', async () => {
    service.getPublicationById.mockResolvedValue(null);
    const res = mockResponse();

    await handler(asUser('FACULTY', { params: { id: 'pub-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(service[serviceMethod]).not.toHaveBeenCalled();
  });

  it('returns 403 when a faculty user is not the owner', async () => {
    service.getPublicationById.mockResolvedValue({ id: 'pub-1', facultyId: 'other' } as never);
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    const res = mockResponse();

    await handler(asUser('FACULTY', { params: { id: 'pub-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(service[serviceMethod]).not.toHaveBeenCalled();
  });

  it('succeeds for the owner and for an admin', async () => {
    service.getPublicationById.mockResolvedValue({ id: 'pub-1', facultyId: 'faculty-1' } as never);
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    const ownerRes = mockResponse();
    await handler(asUser('FACULTY', { params: { id: 'pub-1' }, body: {} }), ownerRes);
    expect(ownerRes.status).toHaveBeenCalledWith(200);

    service.getPublicationById.mockResolvedValue({ id: 'pub-1', facultyId: 'other' } as never);
    const adminRes = mockResponse();
    await handler(asUser('ADMIN', { params: { id: 'pub-1' }, body: {} }), adminRes);
    expect(adminRes.status).toHaveBeenCalledWith(200);

    expect(service[serviceMethod]).toHaveBeenCalledTimes(2);
  });
});
