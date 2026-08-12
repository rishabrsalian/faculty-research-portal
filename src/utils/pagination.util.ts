import { Request } from 'express';
import { PaginationMeta, PaginationQuery } from '../types/api.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const DEFAULT_LIST_PAGE = 1;
export const DEFAULT_LIST_LIMIT = 10;

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListPaginationInput {
  page?: string | number | undefined;
  limit?: string | number | undefined;
}

function toPositiveInt(value: string | number | undefined, fallback: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

/**
 * Extracts and normalizes pagination/sorting parameters from the request query.
 * Clamps `limit` to a maximum of 100 to prevent large data dumps.
 */
export function parsePaginationQuery(req: Request): Required<PaginationQuery> {
  const page = toPositiveInt(req.query['page'] as string, DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, toPositiveInt(req.query['limit'] as string, DEFAULT_LIMIT));
  const sortBy = (req.query['sortBy'] as string) || 'createdAt';
  const sortOrder: 'asc' | 'desc' =
    (req.query['sortOrder'] as string) === 'asc' ? 'asc' : 'desc';
  const search = (req.query['search'] as string) || '';

  return { page, limit, sortBy, sortOrder, search };
}

/**
 * Reads `page`/`limit` from a list request query, falling back to the list defaults.
 */
export function parseListPagination(query: ListPaginationInput): { page: number; limit: number } {
  return {
    page: toPositiveInt(query.page, DEFAULT_LIST_PAGE),
    limit: toPositiveInt(query.limit, DEFAULT_LIST_LIMIT),
  };
}

/**
 * Converts page/limit into Prisma's `skip` and `take` values.
 */
export function getSkipTake(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Builds the `meta` block included in list responses.
 */
export function buildListMeta(total: number, page: number, limit: number): ListMeta {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Builds the richer pagination metadata object used by `sendSuccess`.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const meta = buildListMeta(total, page, limit);
  return {
    ...meta,
    hasNext: page < meta.totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Query-string filters flattened to single string values.
 */
export type QueryFilters = Record<string, string | undefined>;

/**
 * Flattens an Express query object into plain string values so services can
 * read filters without dealing with repeated parameters.
 */
export function parseQueryFilters(query: Record<string, unknown>): QueryFilters {
  const filters: QueryFilters = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      filters[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      filters[key] = value[0];
    }
  }
  return filters;
}

export interface OwnedResourceFilters {
  search?: string;
  facultyId?: string;
}

/**
 * Builds the Prisma `where` clause shared by faculty-owned resources:
 * a case-insensitive title search plus an optional faculty filter.
 */
export function buildOwnedResourceWhere(filters: OwnedResourceFilters): {
  title?: { contains: string; mode: 'insensitive' };
  facultyId?: string;
} {
  return {
    ...(filters.search && { title: { contains: filters.search, mode: 'insensitive' as const } }),
    ...(filters.facultyId && { facultyId: filters.facultyId }),
  };
}
