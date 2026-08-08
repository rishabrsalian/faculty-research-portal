import { Request } from 'express';
import { PaginationMeta, PaginationQuery } from '../types/api.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Extracts and normalizes pagination/sorting parameters from the request query.
 * Clamps `limit` to a maximum of 100 to prevent large data dumps.
 */
export function parsePaginationQuery(req: Request): Required<PaginationQuery> {
  const page = Math.max(1, parseInt(req.query['page'] as string) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query['limit'] as string) || DEFAULT_LIMIT)
  );
  const sortBy = (req.query['sortBy'] as string) || 'createdAt';
  const sortOrder: 'asc' | 'desc' =
    (req.query['sortOrder'] as string) === 'asc' ? 'asc' : 'desc';
  const search = (req.query['search'] as string) || '';

  return { page, limit, sortBy, sortOrder, search };
}

/**
 * Converts page/limit into Prisma's `skip` and `take` values.
 */
export function getPrismaSkipTake(
  page: number,
  limit: number
): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Builds the pagination metadata object to include in list API responses.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
