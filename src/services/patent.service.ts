import { prisma } from '../config/database';
import { PatentStatus } from '@prisma/client';

export class PatentService {
  async getPatents(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.facultyId) where.facultyId = filters.facultyId;
    if (filters.status) where.status = filters.status as PatentStatus;

    const [data, total] = await Promise.all([
      prisma.patent.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculty: { include: { user: { select: { name: true } } } },
        },
        orderBy: { filingDate: 'desc' }
      }),
      prisma.patent.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPatentById(id: string) {
    return prisma.patent.findUnique({
      where: { id },
      include: { faculty: { include: { user: { select: { name: true } } } } }
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
