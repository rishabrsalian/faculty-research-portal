import { z } from 'zod';
import { PublicationStatus } from '@prisma/client';

export const createPublicationSchema = z.object({
  body: z.object({
    publicationTypeId: z.string({ required_error: 'Publication type is required' }),
    title: z.string({ required_error: 'Title is required' }),
    abstract: z.string().optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    month: z.number().int().min(1).max(12).optional(),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    referenceText: z.string().optional(),
    isbnIssn: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pageStart: z.number().int().optional(),
    pageEnd: z.number().int().optional(),
    citationCount: z.number().int().min(0).optional(),
    isScopusIndexed: z.boolean().optional(),
    isWosIndexed: z.boolean().optional(),
    isUgcListed: z.boolean().optional(),
    status: z.nativeEnum(PublicationStatus).optional(),
  }),
});

export const updatePublicationSchema = z.object({
  body: createPublicationSchema.shape.body.partial(),
});

export const publicationQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    year: z.string().regex(/^\d+$/).optional(),
    facultyId: z.string().optional(),
    typeId: z.string().optional(),
    status: z.nativeEnum(PublicationStatus).optional(),
  }),
});
