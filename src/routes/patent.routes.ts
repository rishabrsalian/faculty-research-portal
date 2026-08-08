import { protect } from '../middleware/auth.middleware';
import { Router } from 'express';
import { getPatents, getPatentById, createPatent, updatePatent, deletePatent } from '../controllers/patent.controller';
import { validate } from '../middleware/validate.middleware';
import { createPatentSchema, updatePatentSchema, patentQuerySchema } from '../validation/patent.schema';

const router = Router();

// Public routes
router.get('/', validate(patentQuerySchema), getPatents);
router.get('/:id', getPatentById);

// Protected routes
router.post('/', protect, validate(createPatentSchema), createPatent);
router.put('/:id', protect, validate(updatePatentSchema), updatePatent);
router.delete('/:id', protect, deletePatent);

export default router;
