import { prisma } from '../config/database';
import { PatentStatus, Prisma } from '@prisma/client';
import {
  QueryFilters,
  buildListMeta,
  buildOwnedResourceWhere,
  getSkipTake,
} from '../utils/pagination.util';
import { facultyWithUserNameInclude } from '../utils/prisma-include.util';

export class PatentService {
  async getPatents(filters: QueryFilters, page = 1, limit = 10) {
    const where: Prisma.PatentWhereInput = {
      ...buildOwnedResourceWhere(filters),
      ...(filters.status && { status: filters.status as PatentStatus }),
    };

    const [data, total] = await Promise.all([
      prisma.patent.findMany({
        where,
        ...getSkipTake(page, limit),
        include: facultyWithUserNameInclude,
        orderBy: { filingDate: 'desc' },
      }),
      prisma.patent.count({ where }),
    ]);

    return { data, meta: buildListMeta(total, page, limit) };
  }

  async getPatentById(id: string) {
    return prisma.patent.findUnique({
      where: { id },
      include: facultyWithUserNameInclude,
    });
  }

  async createPatent(facultyId: string, data: any) {
    return prisma.patent.create({ data: { ...data, facultyId } });
  }

  async updatePatent(id: string, data: any) {
    return prisma.patent.update({ where: { id }, data });
  }

  async deletePatent(id: string) {
    return prisma.patent.delete({ where: { id } });
  }
}

export const patentService = new PatentService();
