import { prisma } from '../config/database';

export class FacultyService {
  async getFacultyProfiles(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { department: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    if (filters.department) where.department = { equals: filters.department, mode: 'insensitive' };
    if (filters.designation) where.designation = { equals: filters.designation, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.facultyProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
      }),
      prisma.facultyProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFacultyById(id: string) {
    return prisma.facultyProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        publications: true,
        patents: true,
        projects: true,
        contributions: true,
      }
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
