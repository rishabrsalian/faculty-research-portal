import { protect } from '../middleware/auth.middleware';
import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from '../validation/project.schema';

const router = Router();

// Public routes
router.get('/', validate(projectQuerySchema), getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', protect, validate(createProjectSchema), createProject);
router.put('/:id', protect, validate(updateProjectSchema), updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
