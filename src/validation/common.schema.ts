import { z, ZodRawShape } from 'zod';

const numericString = z.string().regex(/^\d+$/);

/** Query parameters accepted by every list endpoint. */
export const listQueryFields = {
  page: numericString.optional(),
  limit: numericString.optional(),
  search: z.string().optional(),
} as const;

/**
 * Builds a `query` validation schema from the shared list parameters plus any
 * resource-specific filters.
 */
export const listQuerySchema = <T extends ZodRawShape>(extraFields?: T) =>
  z.object({
    query: z.object({ ...listQueryFields, ...(extraFields ?? ({} as T)) }),
  });

/** Filter shared by every faculty-owned resource. */
export const facultyIdFilter = { facultyId: z.string().optional() } as const;
