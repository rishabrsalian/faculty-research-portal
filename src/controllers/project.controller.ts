import { Request, Response } from 'express';
import { AppError } from '../middleware/error.middleware';
import { projectService } from '../services/project.service';
import { prisma } from '../config/database';

const getFacultyIdFromUserId = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  return profile?.id;
};

export const getProjects = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await projectService.getProjects(req.query, page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getProjectById = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  res.status(200).json({ success: true, data: project });
};

export const createProject = async (req: Request, res: Response) => {
  let facultyId = req.body.facultyId;
  if (!facultyId || req.user?.role !== 'ADMIN') {
     facultyId = await getFacultyIdFromUserId(req.user!.sub);
  }
  if (!facultyId) {
    throw new AppError('Faculty profile required', 400, 'BAD_REQUEST');
  }

  const project = await projectService.createProject(facultyId, req.body);
  res.status(201).json({ success: true, data: project });
};

export const updateProject = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  
  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && project.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const updated = await projectService.updateProject(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
};

export const deleteProject = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && project.facultyId !== myFacultyId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await projectService.deleteProject(req.params.id);
  res.status(200).json({ success: true, message: 'Project deleted' });
};
