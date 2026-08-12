import { getPublications, getPublicationById, createPublication, updatePublication, deletePublication } from '../controllers/publication.controller';
import { createPublicationSchema, updatePublicationSchema, publicationQuerySchema } from '../validation/publication.schema';
import { createOwnedResourceRouter } from './owned-resource.routes';

/**
 * @swagger
 * tags:
 *   name: Publications
 *   description: Research publications
 */

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

export default createOwnedResourceRouter({
  handlers: {
    list: getPublications,
    getById: getPublicationById,
    create: createPublication,
    update: updatePublication,
    remove: deletePublication,
  },
  schemas: {
    query: publicationQuerySchema,
    create: createPublicationSchema,
    update: updatePublicationSchema,
  },
});
