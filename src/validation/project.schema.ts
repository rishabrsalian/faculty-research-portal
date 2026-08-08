import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

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

export const projectQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    facultyId: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  }),
});
