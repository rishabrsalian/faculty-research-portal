import { Request } from 'express';
import {
  getFacultyProfiles,
  getFacultyById,
  getMyProfile,
  updateFacultyProfile,
  deleteFacultyProfile,
} from '../../../src/controllers/faculty.controller';
import { facultyService } from '../../../src/services/faculty.service';
import { mockRequest, mockResponse, jsonBody } from '../../helpers/express';

jest.mock('../../../src/services/faculty.service', () => ({
  facultyService: {
    getFacultyProfiles: jest.fn(),
    getFacultyById: jest.fn(),
    getFacultyByUserId: jest.fn(),
    updateFacultyProfile: jest.fn(),
    deleteFacultyProfile: jest.fn(),
  },
}));

const service = facultyService as jest.Mocked<typeof facultyService>;

const asUser = (role: 'ADMIN' | 'FACULTY', overrides: Partial<Request> = {}): Request =>
  mockRequest({
    user: { userId: 'user-1', sub: 'user-1', email: 'a@b.c', role },
    ...overrides,
  } as never);

beforeEach(() => jest.clearAllMocks());

describe('getFacultyProfiles', () => {
  it('forwards the query with parsed pagination', async () => {
    service.getFacultyProfiles.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
    } as never);
    const req = mockRequest({ query: { page: '2', limit: '5' } });
    const res = mockResponse();

    await getFacultyProfiles(req, res);

    expect(service.getFacultyProfiles).toHaveBeenCalledWith(req.query, 2, 5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toMatchObject({ success: true, meta: { page: 2 } });
  });
});

describe('getFacultyById', () => {
  it('returns the profile or a 404', async () => {
    service.getFacultyById.mockResolvedValue({ id: 'faculty-1' } as never);
    const found = mockResponse();
    await getFacultyById(mockRequest({ params: { id: 'faculty-1' } }), found);
    expect(jsonBody(found)).toEqual({ success: true, data: { id: 'faculty-1' } });

    service.getFacultyById.mockResolvedValue(null);
    const missing = mockResponse();
    await getFacultyById(mockRequest({ params: { id: 'x' } }), missing);
    expect(missing.status).toHaveBeenCalledWith(404);
    expect(jsonBody(missing)).toMatchObject({ message: 'Faculty profile not found' });
  });
});

describe('getMyProfile', () => {
  it('looks the profile up by the authenticated user id', async () => {
    service.getFacultyByUserId.mockResolvedValue({ id: 'faculty-1' } as never);
    const res = mockResponse();

    await getMyProfile(asUser('FACULTY'), res);

    expect(service.getFacultyByUserId).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 without an authenticated user', async () => {
    const res = mockResponse();
    await getMyProfile(mockRequest(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(service.getFacultyByUserId).not.toHaveBeenCalled();
  });

  it('returns 404 when the user has no profile yet', async () => {
    service.getFacultyByUserId.mockResolvedValue(null);
    const res = mockResponse();

    await getMyProfile(asUser('FACULTY'), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonBody(res)).toMatchObject({ message: 'Faculty profile not found for this user' });
  });
});

describe('updateFacultyProfile', () => {
  it('updates only the caller\'s own profile', async () => {
    service.updateFacultyProfile.mockResolvedValue({ id: 'faculty-1' } as never);
    const req = asUser('FACULTY', { body: { department: 'CSE' } });
    const res = mockResponse();

    await updateFacultyProfile(req, res);

    expect(service.updateFacultyProfile).toHaveBeenCalledWith('user-1', { department: 'CSE' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 without an authenticated user', async () => {
    const res = mockResponse();
    await updateFacultyProfile(mockRequest({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(service.updateFacultyProfile).not.toHaveBeenCalled();
  });
});

describe('deleteFacultyProfile', () => {
  it('returns 404 when the profile does not exist', async () => {
    service.getFacultyById.mockResolvedValue(null);
    const res = mockResponse();

    await deleteFacultyProfile(asUser('ADMIN', { params: { id: 'faculty-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(service.deleteFacultyProfile).not.toHaveBeenCalled();
  });

  it('forbids a non-admin', async () => {
    service.getFacultyById.mockResolvedValue({ id: 'faculty-1' } as never);
    const res = mockResponse();

    await deleteFacultyProfile(asUser('FACULTY', { params: { id: 'faculty-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(service.deleteFacultyProfile).not.toHaveBeenCalled();
  });

  it('deletes for an admin', async () => {
    service.getFacultyById.mockResolvedValue({ id: 'faculty-1' } as never);
    service.deleteFacultyProfile.mockResolvedValue({ id: 'faculty-1' } as never);
    const res = mockResponse();

    await deleteFacultyProfile(asUser('ADMIN', { params: { id: 'faculty-1' } }), res);

    expect(service.deleteFacultyProfile).toHaveBeenCalledWith('faculty-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toMatchObject({ message: 'Faculty profile deleted' });
  });
});
