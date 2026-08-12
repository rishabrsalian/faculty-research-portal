import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { facultyIdFilter, listQuerySchema } from './common.schema';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    fundingAgency: z.string().optional(),
    amount: z.number().optional(), // It will map to Decimal
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    role: z.string().optional(), // PI or Co-PI
    coInvestigators: z.array(z.string()).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
});

export const projectQuerySchema = listQuerySchema({
  ...facultyIdFilter,
  status: z.nativeEnum(ProjectStatus).optional(),
});
