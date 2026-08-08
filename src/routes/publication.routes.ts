import { protect } from '../middleware/auth.middleware';
import { Router } from 'express';
import { getPublications, getPublicationById, createPublication, updatePublication, deletePublication } from '../controllers/publication.controller';
import { validate } from '../middleware/validate.middleware';
import { createPublicationSchema, updatePublicationSchema, publicationQuerySchema } from '../validation/publication.schema';

/**
 * @swagger
 * tags:
 *   name: Publications
 *   description: Research publications
 */

const router = Router();

/**
 * @swagger
 * /publications:
 *   get:
 *     summary: Get all publications
 *     tags: [Publications]
 *     responses:
 *       200:
 *         description: List of publications
 */
router.get('/', validate(publicationQuerySchema), getPublications);

/**
 * @swagger
 * /publications/{id}:
 *   get:
 *     summary: Get a publication by ID
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publication details
 */
router.get('/:id', getPublicationById);

/**
 * @swagger
 * /publications:
 *   post:
 *     summary: Create a new publication
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, validate(createPublicationSchema), createPublication);

/**
 * @swagger
 * /publications/{id}:
 *   put:
 *     summary: Update a publication
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', protect, validate(updatePublicationSchema), updatePublication);

/**
 * @swagger
 * /publications/{id}:
 *   delete:
 *     summary: Delete a publication
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', protect, deletePublication);

export default router;
