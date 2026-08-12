import { prisma } from '../config/database';
import { PublicationStatus, Prisma } from '@prisma/client';
import {
  QueryFilters,
  buildListMeta,
  buildOwnedResourceWhere,
  getSkipTake,
} from '../utils/pagination.util';
import { facultyWithUserNameInclude } from '../utils/prisma-include.util';

const publicationInclude = {
  ...facultyWithUserNameInclude,
  publicationType: true,
  venue: true,
  authors: true,
} as const;

export class PublicationService {
  async getPublications(filters: QueryFilters, page = 1, limit = 10) {
    const where: Prisma.PublicationWhereInput = {
      ...buildOwnedResourceWhere(filters),
      ...(filters.year && { year: parseInt(filters.year) }),
      ...(filters.typeId && { publicationTypeId: filters.typeId }),
      ...(filters.status && { status: filters.status as PublicationStatus }),
    };

    const [data, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        ...getSkipTake(page, limit),
        include: publicationInclude,
        orderBy: { year: 'desc' },
      }),
      prisma.publication.count({ where }),
    ]);

    return { data, meta: buildListMeta(total, page, limit) };
  }

  async getPublicationById(id: string) {
    return prisma.publication.findUnique({
      where: { id },
      include: publicationInclude,
    });
  }

  async createPublication(facultyId: string, data: any) {
    return prisma.publication.create({
      data: {
        ...data,
        facultyId,
      }
    });
  }

  async updatePublication(id: string, data: any) {
    return prisma.publication.update({
      where: { id },
      data
    });
  }

  async deletePublication(id: string) {
    return prisma.publication.delete({ where: { id } });
  }
}

export const publicationService = new PublicationService();
