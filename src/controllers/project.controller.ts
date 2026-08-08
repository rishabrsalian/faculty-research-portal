import { Request, Response } from 'express';
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
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }
  res.status(200).json({ success: true, data: project });
};

export const createProject = async (req: Request, res: Response) => {
  let facultyId = req.body.facultyId;
  if (!facultyId || req.user?.role !== 'ADMIN') {
     facultyId = await getFacultyIdFromUserId(req.user!.sub);
  }
  if (!facultyId) {
    res.status(400).json({ success: false, message: 'Faculty profile required' });
    return;
  }

  const project = await projectService.createProject(facultyId, req.body);
  res.status(201).json({ success: true, data: project });
};

export const updateProject = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }
  
  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && project.facultyId !== myFacultyId) {
     res.status(403).json({ success: false, message: 'Forbidden' });
     return;
  }

  const updated = await projectService.updateProject(req.params.id, req.body);
  res.status(200).json({ success: true, data: updated });
};

export const deleteProject = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
  if (req.user?.role !== 'ADMIN' && project.facultyId !== myFacultyId) {
     res.status(403).json({ success: false, message: 'Forbidden' });
     return;
  }

  await projectService.deleteProject(req.params.id);
  res.status(200).json({ success: true, message: 'Project deleted' });
};
