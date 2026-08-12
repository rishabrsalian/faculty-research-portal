import { z } from 'zod';
import { PatentStatus } from '@prisma/client';
import { facultyIdFilter, listQuerySchema } from './common.schema';

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

export const patentQuerySchema = listQuerySchema({
  ...facultyIdFilter,
  status: z.nativeEnum(PatentStatus).optional(),
});
