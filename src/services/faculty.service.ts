import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { QueryFilters, buildListMeta, getSkipTake } from '../utils/pagination.util';
import { facultyProfileInclude, userSummarySelect } from '../utils/prisma-include.util';

export class FacultyService {
  async getFacultyProfiles(filters: QueryFilters, page = 1, limit = 10) {
    const search = filters.search;
    const where: Prisma.FacultyProfileWhereInput = {
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.department && {
        department: { equals: filters.department, mode: 'insensitive' as const },
      }),
      ...(filters.designation && {
        designation: { equals: filters.designation, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.facultyProfile.findMany({
        where,
        ...getSkipTake(page, limit),
        include: { user: userSummarySelect },
      }),
      prisma.facultyProfile.count({ where }),
    ]);

    return { data, meta: buildListMeta(total, page, limit) };
  }

  async getFacultyById(id: string) {
    return prisma.facultyProfile.findUnique({
      where: { id },
      include: facultyProfileInclude,
    });
  }

  async getFacultyByUserId(userId: string) {
    return prisma.facultyProfile.findUnique({
      where: { userId },
      include: facultyProfileInclude,
    });
  }

  async updateFacultyProfile(userId: string, data: any) {
    return prisma.facultyProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    });
  }

  async deleteFacultyProfile(id: string) {
    return prisma.facultyProfile.delete({ where: { id } });
  }
}

export const facultyService = new FacultyService();
