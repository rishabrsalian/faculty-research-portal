import { z } from 'zod';
import { PatentStatus } from '@prisma/client';

export const createPatentSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    applicationNo: z.string().optional(),
    patentNo: z.string().optional(),
    filingDate: z.string().datetime().optional(),
    grantDate: z.string().datetime().optional(),
    country: z.string().optional(),
    status: z.nativeEnum(PatentStatus).optional(),
    inventors: z.array(z.string()).optional(),
  }),
});

export const updatePatentSchema = z.object({
  body: createPatentSchema.shape.body.partial(),
});

export const patentQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    facultyId: z.string().optional(),
    status: z.nativeEnum(PatentStatus).optional(),
  }),
});
