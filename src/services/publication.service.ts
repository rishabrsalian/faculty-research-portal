import { prisma } from '../config/database';
import { PublicationStatus } from '@prisma/client';

export class PublicationService {
  async getPublications(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.year) where.year = parseInt(filters.year);
    if (filters.facultyId) where.facultyId = filters.facultyId;
    if (filters.typeId) where.publicationTypeId = filters.typeId;
    if (filters.status) where.status = filters.status as PublicationStatus;

    const [data, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculty: { include: { user: { select: { name: true } } } },
          publicationType: true,
          venue: true,
          authors: true,
        },
        orderBy: { year: 'desc' }
      }),
      prisma.publication.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPublicationById(id: string) {
    return prisma.publication.findUnique({
      where: { id },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        publicationType: true,
        venue: true,
        authors: true,
      }
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
