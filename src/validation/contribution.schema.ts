import { z } from 'zod';

export const createContributionSchema = z.object({
  body: z.object({
    type: z.string({ required_error: 'Contribution type is required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
    organization: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

export const updateContributionSchema = z.object({
  body: createContributionSchema.shape.body.partial(),
});

export const contributionQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    facultyId: z.string().optional(),
  }),
});
