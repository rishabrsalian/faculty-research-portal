import { z } from 'zod';
import { Gender } from '@prisma/client';
import { listQuerySchema } from './common.schema';

export const updateFacultySchema = z.object({
  body: z.object({
    designation: z.string().optional(),
    department: z.string().optional(),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    dateOfJoining: z.string().datetime().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.nativeEnum(Gender).optional(),
    phone: z.string().optional(),
    orcidId: z.string().optional(),
    googleScholarUrl: z.string().url().optional(),
    scopusId: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
    researchInterests: z.array(z.string()).optional(),
    bio: z.string().optional(),
  }),
});

export const facultyQuerySchema = listQuerySchema({
  department: z.string().optional(),
  designation: z.string().optional(),
});
