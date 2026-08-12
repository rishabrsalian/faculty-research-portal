import { prisma } from '../config/database';
import { ProjectStatus, Prisma } from '@prisma/client';
import {
  QueryFilters,
  buildListMeta,
  buildOwnedResourceWhere,
  getSkipTake,
} from '../utils/pagination.util';
import { facultyWithUserNameInclude } from '../utils/prisma-include.util';

export class ProjectService {
  async getProjects(filters: QueryFilters, page = 1, limit = 10) {
    const where: Prisma.ProjectWhereInput = {
      ...buildOwnedResourceWhere(filters),
      ...(filters.status && { status: filters.status as ProjectStatus }),
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        ...getSkipTake(page, limit),
        include: facultyWithUserNameInclude,
        orderBy: { startDate: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return { data, meta: buildListMeta(total, page, limit) };
  }

  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: facultyWithUserNameInclude,
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
