import { protect } from '../middleware/auth.middleware';
import { Router } from 'express';
import { getContributions, getContributionById, createContribution, updateContribution, deleteContribution } from '../controllers/contribution.controller';
import { validate } from '../middleware/validate.middleware';
import { createContributionSchema, updateContributionSchema, contributionQuerySchema } from '../validation/contribution.schema';

const router = Router();

// Public routes
router.get('/', validate(contributionQuerySchema), getContributions);
router.get('/:id', getContributionById);

// Protected routes
router.post('/', protect, validate(createContributionSchema), createContribution);
router.put('/:id', protect, validate(updateContributionSchema), updateContribution);
router.delete('/:id', protect, deleteContribution);

export default router;
