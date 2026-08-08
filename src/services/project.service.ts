import { prisma } from '../config/database';
import { ProjectStatus } from '@prisma/client';

export class ProjectService {
  async getProjects(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.facultyId) where.facultyId = filters.facultyId;
    if (filters.status) where.status = filters.status as ProjectStatus;

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculty: { include: { user: { select: { name: true } } } },
        },
        orderBy: { startDate: 'desc' }
      }),
      prisma.project.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { faculty: { include: { user: { select: { name: true } } } } }
    });
  }

  async createProject(facultyId: string, data: any) {
    return prisma.project.create({ data: { ...data, facultyId } });
  }

  async updateProject(id: string, data: any) {
    return prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  }
}

export const projectService = new ProjectService();
