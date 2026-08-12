import { Request, Response } from 'express';
import * as projectController from '../../../src/controllers/project.controller';
import * as contributionController from '../../../src/controllers/contribution.controller';
import { projectService } from '../../../src/services/project.service';
import { contributionService } from '../../../src/services/contribution.service';
import { prisma } from '../../../src/config/database';
import { mockRequest, mockResponse, jsonBody } from '../../helpers/express';

jest.mock('../../../src/services/project.service', () => ({
  projectService: {
    getProjects: jest.fn(),
    getProjectById: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

jest.mock('../../../src/services/contribution.service', () => ({
  contributionService: {
    getContributions: jest.fn(),
    getContributionById: jest.fn(),
    createContribution: jest.fn(),
    updateContribution: jest.fn(),
    deleteContribution: jest.fn(),
  },
}));

jest.mock('../../../src/config/database', () => ({
  prisma: { facultyProfile: { findUnique: jest.fn() } },
}));

const findProfile = prisma.facultyProfile.findUnique as jest.Mock;

type Handler = (req: Request, res: Response) => Promise<void>;

/**
 * The project and professional-contribution controllers implement the same
 * ownership rules: faculty users may only touch their own records, admins any.
 */
const cases = [
  {
    name: 'project.controller',
    notFoundMessage: 'Project not found',
    deletedMessage: 'Project deleted',
    list: projectController.getProjects as Handler,
    getById: projectController.getProjectById as Handler,
    create: projectController.createProject as Handler,
    update: projectController.updateProject as Handler,
    remove: projectController.deleteProject as Handler,
    serviceMocks: projectService as unknown as Record<string, jest.Mock>,
    listMethod: 'getProjects',
    getMethod: 'getProjectById',
    createMethod: 'createProject',
    updateMethod: 'updateProject',
    deleteMethod: 'deleteProject',
  },
  {
    name: 'contribution.controller',
    notFoundMessage: 'Contribution not found',
    deletedMessage: 'Contribution deleted',
    list: contributionController.getContributions as Handler,
    getById: contributionController.getContributionById as Handler,
    create: contributionController.createContribution as Handler,
    update: contributionController.updateContribution as Handler,
    remove: contributionController.deleteContribution as Handler,
    serviceMocks: contributionService as unknown as Record<string, jest.Mock>,
    listMethod: 'getContributions',
    getMethod: 'getContributionById',
    createMethod: 'createContribution',
    updateMethod: 'updateContribution',
    deleteMethod: 'deleteContribution',
  },
] as const;

const asUser = (role: 'ADMIN' | 'FACULTY', overrides: Partial<Request> = {}): Request =>
  mockRequest({
    user: { userId: 'user-1', sub: 'user-1', email: 'a@b.c', role },
    ...overrides,
  } as never);

describe.each(cases)('$name', (testCase) => {
  const service = testCase.serviceMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    service[testCase.listMethod]!.mockResolvedValue({ data: [], meta: { total: 0 } });
    service[testCase.createMethod]!.mockResolvedValue({ id: 'r1' });
    service[testCase.updateMethod]!.mockResolvedValue({ id: 'r1' });
    service[testCase.deleteMethod]!.mockResolvedValue({ id: 'r1' });
  });

  it('lists with parsed pagination, defaulting to page 1 / limit 10', async () => {
    const req = mockRequest({ query: { page: '2', limit: '30' } });
    const res = mockResponse();
    await testCase.list(req, res);
    expect(service[testCase.listMethod]).toHaveBeenCalledWith(req.query, 2, 30);
    expect(res.status).toHaveBeenCalledWith(200);

    await testCase.list(mockRequest(), mockResponse());
    expect(service[testCase.listMethod]).toHaveBeenLastCalledWith(expect.anything(), 1, 10);
  });

  it('returns the record or a 404', async () => {
    service[testCase.getMethod]!.mockResolvedValue({ id: 'r1' });
    const found = mockResponse();
    await testCase.getById(mockRequest({ params: { id: 'r1' } }), found);
    expect(jsonBody(found)).toEqual({ success: true, data: { id: 'r1' } });

    service[testCase.getMethod]!.mockResolvedValue(null);
    const missing = mockResponse();
    await testCase.getById(mockRequest({ params: { id: 'r1' } }), missing);
    expect(missing.status).toHaveBeenCalledWith(404);
    expect(jsonBody(missing)).toMatchObject({ message: testCase.notFoundMessage });
  });

  it('creates for an explicit facultyId as admin and for the caller as faculty', async () => {
    const adminReq = asUser('ADMIN', { body: { facultyId: 'faculty-9' } });
    await testCase.create(adminReq, mockResponse());
    expect(findProfile).not.toHaveBeenCalled();
    expect(service[testCase.createMethod]).toHaveBeenLastCalledWith('faculty-9', adminReq.body);

    findProfile.mockResolvedValue({ id: 'faculty-1' });
    const facultyReq = asUser('FACULTY', { body: { facultyId: 'faculty-9' } });
    await testCase.create(facultyReq, mockResponse());
    expect(service[testCase.createMethod]).toHaveBeenLastCalledWith('faculty-1', facultyReq.body);
  });

  it('returns 400 when the caller has no faculty profile', async () => {
    findProfile.mockResolvedValue(null);
    const res = mockResponse();
    await testCase.create(asUser('FACULTY', { body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonBody(res)).toMatchObject({ message: 'Faculty profile required' });
  });

  it.each([
    ['update', 'update' as const],
    ['delete', 'delete' as const],
  ])('%ss only when the caller owns the record or is an admin', async (_label, action) => {
    const handler = action === 'update' ? testCase.update : testCase.remove;
    const method = action === 'update' ? testCase.updateMethod : testCase.deleteMethod;

    service[testCase.getMethod]!.mockResolvedValue(null);
    const missing = mockResponse();
    await handler(asUser('FACULTY', { params: { id: 'r1' } }), missing);
    expect(missing.status).toHaveBeenCalledWith(404);

    service[testCase.getMethod]!.mockResolvedValue({ id: 'r1', facultyId: 'faculty-other' });
    findProfile.mockResolvedValue({ id: 'faculty-1' });
    const forbidden = mockResponse();
    await handler(asUser('FACULTY', { params: { id: 'r1' } }), forbidden);
    expect(forbidden.status).toHaveBeenCalledWith(403);
    expect(service[method]).not.toHaveBeenCalled();

    const admin = mockResponse();
    await handler(asUser('ADMIN', { params: { id: 'r1' }, body: {} }), admin);
    expect(admin.status).toHaveBeenCalledWith(200);

    service[testCase.getMethod]!.mockResolvedValue({ id: 'r1', facultyId: 'faculty-1' });
    const owner = mockResponse();
    await handler(asUser('FACULTY', { params: { id: 'r1' }, body: {} }), owner);
    expect(owner.status).toHaveBeenCalledWith(200);
    expect(service[method]).toHaveBeenCalledTimes(2);
  });
});
