import { Router, RequestHandler } from 'express';
import { AnyZodObject } from 'zod';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export interface OwnedResourceRouterOptions {
  handlers: {
    list: RequestHandler;
    getById: RequestHandler;
    create: RequestHandler;
    update: RequestHandler;
    remove: RequestHandler;
  };
  schemas: {
    query: AnyZodObject;
    create: AnyZodObject;
    update: AnyZodObject;
  };
}

/**
 * Builds the route table shared by faculty-owned resources: public reads,
 * authenticated writes, and Zod validation on list/create/update.
 */
export function createOwnedResourceRouter({
  handlers,
  schemas,
}: OwnedResourceRouterOptions): Router {
  const router = Router();

  router.get('/', validate(schemas.query), handlers.list);
  router.get('/:id', handlers.getById);

  router.post('/', protect, validate(schemas.create), handlers.create);
  router.put('/:id', protect, validate(schemas.update), handlers.update);
  router.delete('/:id', protect, handlers.remove);

  return router;
}
