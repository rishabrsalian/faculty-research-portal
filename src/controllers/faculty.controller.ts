import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { facultyService } from '../services/faculty.service';

export const getFacultyProfiles = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await facultyService.getFacultyProfiles(req.query, page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getFacultyById = async (req: Request, res: Response) => {
  const faculty = await facultyService.getFacultyById(req.params.id);
  if (!faculty) {
    throw new AppError('Faculty profile not found', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: faculty });
};

export const updateFacultyProfile = async (req: Request, res: Response) => {
  // Using userId from auth token (req.user) to ensure faculty can only update their own profile
  const userId = req.user?.sub;
  if (!userId) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const updatedProfile = await facultyService.updateFacultyProfile(userId, req.body);
  res.status(200).json({ success: true, data: updatedProfile });
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  // facultyProfile is keyed by userId, not profile id
  const faculty = await facultyService.getFacultyByUserId(userId);
  if (!faculty) {
    throw new AppError('Faculty profile not found for this user', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: faculty });
};

export const deleteFacultyProfile = async (req: Request, res: Response) => {
  const faculty = await facultyService.getFacultyById(req.params.id);
  if (!faculty) {
    throw new AppError('Faculty profile not found', 404, 'NOT_FOUND');
  }
  
  // Optional: check if ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await facultyService.deleteFacultyProfile(req.params.id);
  res.status(200).json({ success: true, message: 'Faculty profile deleted' });
};
