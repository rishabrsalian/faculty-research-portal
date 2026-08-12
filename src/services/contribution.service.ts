import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import {
  QueryFilters,
  buildListMeta,
  buildOwnedResourceWhere,
  getSkipTake,
} from '../utils/pagination.util';
import { facultyWithUserNameInclude } from '../utils/prisma-include.util';

export class ContributionService {
  async getContributions(filters: QueryFilters, page = 1, limit = 10) {
    const where: Prisma.ProfessionalContributionWhereInput = buildOwnedResourceWhere(filters);

    const [data, total] = await Promise.all([
      prisma.professionalContribution.findMany({
        where,
        ...getSkipTake(page, limit),
        include: facultyWithUserNameInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.professionalContribution.count({ where }),
    ]);

    return { data, meta: buildListMeta(total, page, limit) };
  }

  async getContributionById(id: string) {
    return prisma.professionalContribution.findUnique({
      where: { id },
      include: facultyWithUserNameInclude,
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
