import { FacultyService } from '../../../src/services/faculty.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    facultyProfile: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const profile = prisma.facultyProfile as unknown as Record<string, jest.Mock>;
const service = new FacultyService();

beforeEach(() => {
  jest.clearAllMocks();
  profile['findMany']!.mockResolvedValue([{ id: 'faculty-1' }]);
  profile['count']!.mockResolvedValue(1);
});

describe('FacultyService.getFacultyProfiles', () => {
  const whereOf = () => profile['findMany']!.mock.calls[0][0].where;

  it('applies default pagination and no filters', async () => {
    const result = await service.getFacultyProfiles({});
    expect(whereOf()).toEqual({});
    expect(profile['findMany']!.mock.calls[0][0]).toMatchObject({ skip: 0, take: 10 });
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it('searches across the user name and the department', async () => {
    await service.getFacultyProfiles({ search: 'kumar' });
    expect(whereOf()).toEqual({
      OR: [
        { user: { name: { contains: 'kumar', mode: 'insensitive' } } },
        { department: { contains: 'kumar', mode: 'insensitive' } },
      ],
    });
  });

  it('matches department and designation case-insensitively', async () => {
    await service.getFacultyProfiles({ department: 'CSE', designation: 'Professor' });
    expect(whereOf()).toEqual({
      department: { equals: 'CSE', mode: 'insensitive' },
      designation: { equals: 'Professor', mode: 'insensitive' },
    });
  });

  it('rounds totalPages up for a partial last page', async () => {
    profile['count']!.mockResolvedValue(11);
    const result = await service.getFacultyProfiles({}, 2, 5);
    expect(profile['findMany']!.mock.calls[0][0]).toMatchObject({ skip: 5, take: 5 });
    expect(result.meta.totalPages).toBe(3);
  });
});

describe('FacultyService lookups and mutations', () => {
  it('looks a profile up by its own id', async () => {
    profile['findUnique']!.mockResolvedValue({ id: 'faculty-1' });
    await service.getFacultyById('faculty-1');
    expect(profile['findUnique']!.mock.calls[0][0]).toMatchObject({ where: { id: 'faculty-1' } });
  });

  it('looks a profile up by user id', async () => {
    profile['findUnique']!.mockResolvedValue(null);
    await expect(service.getFacultyByUserId('user-1')).resolves.toBeNull();
    expect(profile['findUnique']!.mock.calls[0][0]).toMatchObject({ where: { userId: 'user-1' } });
  });

  it('upserts the profile, seeding userId on create', async () => {
    profile['upsert']!.mockResolvedValue({ id: 'faculty-1' });
    await service.updateFacultyProfile('user-1', { department: 'CSE' });
    expect(profile['upsert']).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      update: { department: 'CSE' },
      create: { userId: 'user-1', department: 'CSE' },
    });
  });

  it('deletes by profile id', async () => {
    profile['delete']!.mockResolvedValue({ id: 'faculty-1' });
    await service.deleteFacultyProfile('faculty-1');
    expect(profile['delete']).toHaveBeenCalledWith({ where: { id: 'faculty-1' } });
  });
});
