import { prisma } from '../config/database';

export class ContributionService {
  async getContributions(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.facultyId) where.facultyId = filters.facultyId;

    const [data, total] = await Promise.all([
      prisma.professionalContribution.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculty: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.professionalContribution.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getContributionById(id: string) {
    return prisma.professionalContribution.findUnique({
      where: { id },
      include: { faculty: { include: { user: { select: { name: true } } } } }
    });
  }

  async createContribution(facultyId: string, data: any) {
    return prisma.professionalContribution.create({ data: { ...data, facultyId } });
  }

  async updateContribution(id: string, data: any) {
    return prisma.professionalContribution.update({ where: { id }, data });
  }

  async deleteContribution(id: string) {
    return prisma.professionalContribution.delete({ where: { id } });
  }
}

export const contributionService = new ContributionService();
