import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/rbac.middleware';
import { Router } from 'express';
import { getFacultyProfiles, getFacultyById, updateFacultyProfile, deleteFacultyProfile, getMyProfile } from '../controllers/faculty.controller';
import { validate } from '../middleware/validate.middleware';
import { updateFacultySchema, facultyQuerySchema } from '../validation/faculty.schema';

/**
 * @swagger
 * tags:
 *   name: Faculty
 *   description: Faculty profile management
 */

const router = Router();

/**
 * @swagger
 * /faculty:
 *   get:
 *     summary: Get all faculty profiles
 *     tags: [Faculty]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or department
 *     responses:
 *       200:
 *         description: List of faculty profiles
 */
router.get('/', validate(facultyQuerySchema), getFacultyProfiles);

/**
 * @swagger
 * /faculty/me:
 *   get:
 *     summary: Get own faculty profile
 *     tags: [Faculty]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Own faculty profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Faculty profile not found
 */
// IMPORTANT: /me must be registered BEFORE /:id to avoid Express treating "me" as an ID
router.get('/me', protect, getMyProfile);

router.get('/:id', getFacultyById);

/**
 * @swagger
 * /faculty/me:
 *   put:
 *     summary: Update own faculty profile
 *     tags: [Faculty]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', protect, validate(updateFacultySchema), updateFacultyProfile);

/**
 * @swagger
 * /faculty/{id}:
 *   delete:
 *     summary: Delete a faculty profile
 *     tags: [Faculty]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty profile ID
 *     responses:
 *       200:
 *         description: Faculty profile deleted
 *       403:
 *         description: Forbidden (Requires ADMIN role)
 *       404:
 *         description: Faculty profile not found
 */
router.delete('/:id', protect, restrictTo('ADMIN'), deleteFacultyProfile);

export default router;
