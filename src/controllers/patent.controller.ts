import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { patentService } from '../services/patent.service';
import { prisma } from '../config/database';

const getFacultyIdFromUserId = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  return profile?.id;
};

export const getPatents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await patentService.getPatents(req.query, page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getPatentById = async (req: Request, res: Response) => {
  const patent = await patentService.getPatentById(req.params.id);
  if (!patent) {
    throw new AppError('Patent not found', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: patent });
};

export const createPatent = async (req: Request, res: Response) => {
  let facultyId = req.body.facultyId;
  if (!facultyId || req.user?.role !== 'ADMIN') {
     facultyId = await getFacultyIdFromUserId(req.user!.sub);
  }
  if (!facultyId) {
    throw new AppError('Faculty profile required', 400, 'BAD_REQUEST');
  }

  const patent = await patentService.createPatent(facultyId, req.body);
  res.status(201).json({ success: true, data: patent });
};

export const updatePatent = async (req: Request, res: Response) => {
  const patent = await patentService.getPatentById(req.params.id);
  if (!patent) {
    throw new AppError('Patent not found', 404, 'NOT_FOUND');
  }
  
  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && patent.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const updated = await patentService.updatePatent(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
};

export const deletePatent = async (req: Request, res: Response) => {
  const patent = await patentService.getPatentById(req.params.id);
  if (!patent) {
    throw new AppError('Patent not found', 404, 'NOT_FOUND');
  }

  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && patent.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await patentService.deletePatent(req.params.id);
  res.status(200).json({ success: true, message: 'Patent deleted' });
};
