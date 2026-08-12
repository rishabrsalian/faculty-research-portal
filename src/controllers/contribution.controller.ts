import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { contributionService } from '../services/contribution.service';
import { prisma } from '../config/database';

const getFacultyIdFromUserId = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  return profile?.id;
};

export const getContributions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await contributionService.getContributions(req.query, page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getContributionById = async (req: Request, res: Response) => {
  const contribution = await contributionService.getContributionById(req.params.id);
  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: contribution });
};

export const createContribution = async (req: Request, res: Response) => {
  let facultyId = req.body.facultyId;
  if (!facultyId || req.user?.role !== 'ADMIN') {
     facultyId = await getFacultyIdFromUserId(req.user!.sub);
  }
  if (!facultyId) {
    throw new AppError('Faculty profile required', 400, 'BAD_REQUEST');
  }

  const contribution = await contributionService.createContribution(facultyId, req.body);
  res.status(201).json({ success: true, data: contribution });
};

export const updateContribution = async (req: Request, res: Response) => {
  const contribution = await contributionService.getContributionById(req.params.id);
  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }
  
  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && contribution.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const updated = await contributionService.updateContribution(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
};

export const deleteContribution = async (req: Request, res: Response) => {
  const contribution = await contributionService.getContributionById(req.params.id);
  if (!contribution) {
    throw new AppError('Contribution not found', 404, 'NOT_FOUND');
  }

  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && contribution.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await contributionService.deleteContribution(req.params.id);
  res.status(200).json({ success: true, message: 'Contribution deleted' });
};
