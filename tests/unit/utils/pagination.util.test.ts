import { Request } from 'express';
import {
  parsePaginationQuery,
  getPrismaSkipTake,
  buildPaginationMeta,
} from '../../../src/utils/pagination.util';

const requestWithQuery = (query: Record<string, unknown>): Request =>
  ({ query } as unknown as Request);

describe('parsePaginationQuery', () => {
  it('returns defaults when no query parameters are present', () => {
    expect(parsePaginationQuery(requestWithQuery({}))).toEqual({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: '',
    });
  });

  it('parses numeric strings for page and limit', () => {
    const result = parsePaginationQuery(requestWithQuery({ page: '3', limit: '50' }));
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('clamps limit to the maximum of 100', () => {
    expect(parsePaginationQuery(requestWithQuery({ limit: '5000' })).limit).toBe(100);
  });

  it('falls back to a minimum of 1 for non-positive or invalid values', () => {
    expect(parsePaginationQuery(requestWithQuery({ page: '0', limit: '0' }))).toMatchObject({
      page: 1,
      limit: 20,
    });
    expect(parsePaginationQuery(requestWithQuery({ page: '-4', limit: '-9' }))).toMatchObject({
      page: 1,
      limit: 1,
    });
    expect(parsePaginationQuery(requestWithQuery({ page: 'abc', limit: 'xyz' }))).toMatchObject({
      page: 1,
      limit: 20,
    });
  });

  it('only accepts "asc" as an ascending sort order', () => {
    expect(parsePaginationQuery(requestWithQuery({ sortOrder: 'asc' })).sortOrder).toBe('asc');
    expect(parsePaginationQuery(requestWithQuery({ sortOrder: 'ASC' })).sortOrder).toBe('desc');
    expect(parsePaginationQuery(requestWithQuery({ sortOrder: 'anything' })).sortOrder).toBe('desc');
  });

  it('passes through sortBy and search', () => {
    const result = parsePaginationQuery(requestWithQuery({ sortBy: 'title', search: 'neural' }));
    expect(result.sortBy).toBe('title');
    expect(result.search).toBe('neural');
  });
});

describe('getPrismaSkipTake', () => {
  it('computes skip from the 1-based page number', () => {
    expect(getPrismaSkipTake(1, 20)).toEqual({ skip: 0, take: 20 });
    expect(getPrismaSkipTake(4, 25)).toEqual({ skip: 75, take: 25 });
  });
});

describe('buildPaginationMeta', () => {
  it('reports navigation flags for a middle page', () => {
    expect(buildPaginationMeta(95, 3, 10)).toEqual({
      page: 3,
      limit: 10,
      total: 95,
      totalPages: 10,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('has no previous page on the first page and no next page on the last', () => {
    expect(buildPaginationMeta(30, 1, 10)).toMatchObject({ hasNext: true, hasPrev: false });
    expect(buildPaginationMeta(30, 3, 10)).toMatchObject({ hasNext: false, hasPrev: true });
  });

  it('handles an empty result set', () => {
    expect(buildPaginationMeta(0, 1, 20)).toMatchObject({
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});
