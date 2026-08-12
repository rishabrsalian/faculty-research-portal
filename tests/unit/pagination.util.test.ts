import {
  buildListMeta,
  buildOwnedResourceWhere,
  getSkipTake,
  parseListPagination,
  parseQueryFilters,
} from '../../src/utils/pagination.util';

describe('parseListPagination', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(parseListPagination({})).toEqual({ page: 1, limit: 10 });
    expect(parseListPagination({ page: 'abc', limit: '0' })).toEqual({ page: 1, limit: 10 });
  });

  it('reads numeric strings and numbers', () => {
    expect(parseListPagination({ page: '3', limit: '25' })).toEqual({ page: 3, limit: 25 });
    expect(parseListPagination({ page: 2, limit: 5 })).toEqual({ page: 2, limit: 5 });
  });
});

describe('getSkipTake', () => {
  it('converts page/limit into Prisma skip/take', () => {
    expect(getSkipTake(1, 10)).toEqual({ skip: 0, take: 10 });
    expect(getSkipTake(3, 10)).toEqual({ skip: 20, take: 10 });
  });
});

describe('buildListMeta', () => {
  it('computes total pages', () => {
    expect(buildListMeta(25, 2, 10)).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
  });
});

describe('parseQueryFilters', () => {
  it('keeps strings and collapses repeated parameters', () => {
    expect(parseQueryFilters({ search: 'ai', facultyId: ['a', 'b'], page: 1 })).toEqual({
      search: 'ai',
      facultyId: 'a',
    });
  });
});

describe('buildOwnedResourceWhere', () => {
  it('omits absent filters', () => {
    expect(buildOwnedResourceWhere({})).toEqual({});
  });

  it('builds a case-insensitive title search with faculty filter', () => {
    expect(buildOwnedResourceWhere({ search: 'ai', facultyId: 'f1' })).toEqual({
      title: { contains: 'ai', mode: 'insensitive' },
      facultyId: 'f1',
    });
  });
});
