import { PublicationStatus } from '@prisma/client';
import { PublicationService } from '../../../src/services/publication.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    publication: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const publication = prisma.publication as unknown as Record<string, jest.Mock>;
const service = new PublicationService();

beforeEach(() => {
  jest.clearAllMocks();
  publication['findMany']!.mockResolvedValue([{ id: 'pub-1' }]);
  publication['count']!.mockResolvedValue(1);
});

describe('PublicationService.getPublications', () => {
  const whereOf = () => publication['findMany']!.mock.calls[0][0].where;

  it('queries with no filters and default pagination', async () => {
    const result = await service.getPublications({});

    expect(whereOf()).toEqual({});
    expect(publication['findMany']!.mock.calls[0][0]).toMatchObject({
      skip: 0,
      take: 10,
      orderBy: { year: 'desc' },
    });
    expect(result).toEqual({
      data: [{ id: 'pub-1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  });

  it('computes skip from the page and reports totalPages', async () => {
    publication['count']!.mockResolvedValue(42);
    const result = await service.getPublications({}, 3, 20);

    expect(publication['findMany']!.mock.calls[0][0]).toMatchObject({ skip: 40, take: 20 });
    expect(result.meta).toEqual({ total: 42, page: 3, limit: 20, totalPages: 3 });
  });

  it('builds a case-insensitive title search', async () => {
    await service.getPublications({ search: 'transformer' });
    expect(whereOf()).toEqual({ title: { contains: 'transformer', mode: 'insensitive' } });
  });

  it('parses the year filter into a number and maps typeId to publicationTypeId', async () => {
    await service.getPublications({
      year: '2023',
      facultyId: 'faculty-1',
      typeId: 'type-1',
      status: PublicationStatus.PUBLISHED,
    });
    expect(whereOf()).toEqual({
      year: 2023,
      facultyId: 'faculty-1',
      publicationTypeId: 'type-1',
      status: PublicationStatus.PUBLISHED,
    });
  });

  it('uses the same where clause for the data and count queries', async () => {
    await service.getPublications({ facultyId: 'faculty-1' });
    expect(publication['count']!.mock.calls[0][0].where).toEqual({ facultyId: 'faculty-1' });
  });
});

describe('PublicationService CRUD', () => {
  it('fetches a publication by id with its relations', async () => {
    publication['findUnique']!.mockResolvedValue({ id: 'pub-1' });
    await expect(service.getPublicationById('pub-1')).resolves.toEqual({ id: 'pub-1' });
    expect(publication['findUnique']!.mock.calls[0][0]).toMatchObject({ where: { id: 'pub-1' } });
  });

  it('attaches the faculty id when creating', async () => {
    publication['create']!.mockResolvedValue({ id: 'pub-1' });
    await service.createPublication('faculty-1', { title: 'A paper' });
    expect(publication['create']).toHaveBeenCalledWith({
      data: { title: 'A paper', facultyId: 'faculty-1' },
    });
  });

  it('passes the patch straight through when updating', async () => {
    publication['update']!.mockResolvedValue({ id: 'pub-1' });
    await service.updatePublication('pub-1', { title: 'Revised' });
    expect(publication['update']).toHaveBeenCalledWith({
      where: { id: 'pub-1' },
      data: { title: 'Revised' },
    });
  });

  it('deletes by id', async () => {
    publication['delete']!.mockResolvedValue({ id: 'pub-1' });
    await service.deletePublication('pub-1');
    expect(publication['delete']).toHaveBeenCalledWith({ where: { id: 'pub-1' } });
  });
});
