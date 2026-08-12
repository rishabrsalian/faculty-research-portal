import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { publicationService } from '../services/publication.service';
import { prisma } from '../config/database';

const getFacultyIdFromUserId = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  return profile?.id;
};

export const getPublications = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await publicationService.getPublications(req.query, page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getPublicationById = async (req: Request, res: Response) => {
  const publication = await publicationService.getPublicationById(req.params.id);
  if (!publication) {
    throw new AppError('Publication not found', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: publication });
};

export const createPublication = async (req: Request, res: Response) => {
  let facultyId = req.body.facultyId;
  if (!facultyId || req.user?.role !== 'ADMIN') {
    facultyId = await getFacultyIdFromUserId(req.user!.sub);
  }
  if (!facultyId) {
    throw new AppError('Faculty profile required to create publication', 400, 'BAD_REQUEST');
  }

  const publication = await publicationService.createPublication(facultyId, req.body);
  res.status(201).json({ success: true, data: publication });
};

export const updatePublication = async (req: Request, res: Response) => {
  const publication = await publicationService.getPublicationById(req.params.id);
  if (!publication) {
    throw new AppError('Publication not found', 404, 'NOT_FOUND');
  }
  
  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && publication.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const updated = await publicationService.updatePublication(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
};

export const deletePublication = async (req: Request, res: Response) => {
  const publication = await publicationService.getPublicationById(req.params.id);
  if (!publication) {
    throw new AppError('Publication not found', 404, 'NOT_FOUND');
  }

  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && publication.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await publicationService.deletePublication(req.params.id);
  res.status(200).json({ success: true, message: 'Publication deleted' });
};
