import { PatentStatus, ProjectStatus } from '@prisma/client';
import { PatentService } from '../../../src/services/patent.service';
import { ProjectService } from '../../../src/services/project.service';
import { ContributionService } from '../../../src/services/contribution.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => {
  const stub = () => ({
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });
  return {
    prisma: {
      patent: stub(),
      project: stub(),
      professionalContribution: stub(),
    },
  };
});

type Delegate = Record<string, jest.Mock>;

const patentService = new PatentService();
const projectService = new ProjectService();
const contributionService = new ContributionService();

/**
 * The patent, project and contribution services share the same shape:
 * a filtered+paginated list plus id-based CRUD over a single Prisma model.
 */
const cases = [
  {
    name: 'PatentService',
    model: prisma.patent as unknown as Delegate,
    orderBy: { filingDate: 'desc' },
    list: (f: unknown, page?: number, limit?: number) =>
      patentService.getPatents(f, page, limit),
    getById: (id: string) => patentService.getPatentById(id),
    create: (facultyId: string, data: unknown) => patentService.createPatent(facultyId, data),
    update: (id: string, data: unknown) => patentService.updatePatent(id, data),
    remove: (id: string) => patentService.deletePatent(id),
    statusFilter: PatentStatus.GRANTED,
  },
  {
    name: 'ProjectService',
    model: prisma.project as unknown as Delegate,
    orderBy: { startDate: 'desc' },
    list: (f: unknown, page?: number, limit?: number) =>
      projectService.getProjects(f, page, limit),
    getById: (id: string) => projectService.getProjectById(id),
    create: (facultyId: string, data: unknown) => projectService.createProject(facultyId, data),
    update: (id: string, data: unknown) => projectService.updateProject(id, data),
    remove: (id: string) => projectService.deleteProject(id),
    statusFilter: ProjectStatus.ONGOING,
  },
  {
    name: 'ContributionService',
    model: prisma.professionalContribution as unknown as Delegate,
    orderBy: { createdAt: 'desc' },
    list: (f: unknown, page?: number, limit?: number) =>
      contributionService.getContributions(f, page, limit),
    getById: (id: string) => contributionService.getContributionById(id),
    create: (facultyId: string, data: unknown) =>
      contributionService.createContribution(facultyId, data),
    update: (id: string, data: unknown) => contributionService.updateContribution(id, data),
    remove: (id: string) => contributionService.deleteContribution(id),
    statusFilter: undefined,
  },
] as const;

describe.each(cases)('$name', (testCase) => {
  const model = testCase.model;

  beforeEach(() => {
    jest.clearAllMocks();
    model['findMany']!.mockResolvedValue([{ id: 'r1' }]);
    model['count']!.mockResolvedValue(1);
  });

  it('lists with default pagination, no filters and the expected ordering', async () => {
    const result = await testCase.list({});

    expect(model['findMany']!.mock.calls[0][0]).toMatchObject({
      where: {},
      skip: 0,
      take: 10,
      orderBy: testCase.orderBy,
    });
    expect(result).toEqual({
      data: [{ id: 'r1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  });

  it('computes skip/take and totalPages from page and limit', async () => {
    model['count']!.mockResolvedValue(31);
    const result = await testCase.list({}, 2, 15);

    expect(model['findMany']!.mock.calls[0][0]).toMatchObject({ skip: 15, take: 15 });
    expect(result.meta).toEqual({ total: 31, page: 2, limit: 15, totalPages: 3 });
  });

  it('builds a case-insensitive title search and a faculty filter', async () => {
    await testCase.list({ search: 'grid', facultyId: 'faculty-1' });
    expect(model['findMany']!.mock.calls[0][0].where).toEqual({
      title: { contains: 'grid', mode: 'insensitive' },
      facultyId: 'faculty-1',
    });
  });

  it('applies the status filter only when the service supports one', async () => {
    await testCase.list({ status: testCase.statusFilter ?? 'IGNORED' });
    const where = model['findMany']!.mock.calls[0][0].where;
    if (testCase.statusFilter) {
      expect(where).toEqual({ status: testCase.statusFilter });
    } else {
      expect(where).toEqual({});
    }
  });

  it('fetches by id', async () => {
    model['findUnique']!.mockResolvedValue(null);
    await expect(testCase.getById('r1')).resolves.toBeNull();
    expect(model['findUnique']!.mock.calls[0][0]).toMatchObject({ where: { id: 'r1' } });
  });

  it('attaches facultyId on create', async () => {
    model['create']!.mockResolvedValue({ id: 'r1' });
    await testCase.create('faculty-1', { title: 'New' });
    expect(model['create']).toHaveBeenCalledWith({
      data: { title: 'New', facultyId: 'faculty-1' },
    });
  });

  it('updates and deletes by id', async () => {
    model['update']!.mockResolvedValue({ id: 'r1' });
    model['delete']!.mockResolvedValue({ id: 'r1' });

    await testCase.update('r1', { title: 'Renamed' });
    await testCase.remove('r1');

    expect(model['update']).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { title: 'Renamed' },
    });
    expect(model['delete']).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });
});
