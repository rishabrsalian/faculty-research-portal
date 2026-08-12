import { Request, Response } from 'express';
import { facultyService } from '../services/faculty.service';
import { parseListPagination, parseQueryFilters } from '../utils/pagination.util';

export const getFacultyProfiles = async (req: Request, res: Response) => {
  const { page, limit } = parseListPagination(req.query);

  const result = await facultyService.getFacultyProfiles(parseQueryFilters(req.query), page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getFacultyById = async (req: Request, res: Response) => {
  const faculty = await facultyService.getFacultyById(req.params.id);
  if (!faculty) {
    res.status(404).json({ success: false, message: 'Faculty profile not found' });
    return;
  }
  res.status(200).json({ success: true, data: faculty });
};

export const updateFacultyProfile = async (req: Request, res: Response) => {
  // Using userId from auth token (req.user) to ensure faculty can only update their own profile
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const updatedProfile = await facultyService.updateFacultyProfile(userId, req.body);
  res.status(200).json({ success: true, data: updatedProfile });
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // facultyProfile is keyed by userId, not profile id
  const faculty = await facultyService.getFacultyByUserId(userId);
  if (!faculty) {
    res.status(404).json({ success: false, message: 'Faculty profile not found for this user' });
    return;
  }
  res.status(200).json({ success: true, data: faculty });
};

export const deleteFacultyProfile = async (req: Request, res: Response) => {
  const faculty = await facultyService.getFacultyById(req.params.id);
  if (!faculty) {
    res.status(404).json({ success: false, message: 'Faculty profile not found' });
    return;
  }

  // Optional: check if ADMIN
  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ success: false, message: 'Forbidden' });
     return;
  }

  await facultyService.deleteFacultyProfile(req.params.id);
  res.status(200).json({ success: true, message: 'Faculty profile deleted' });
};
