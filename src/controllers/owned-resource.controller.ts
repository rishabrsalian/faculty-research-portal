import { Request, Response } from 'express';
import { getFacultyIdFromUserId } from '../utils/faculty.util';
import {
  ListMeta,
  QueryFilters,
  parseListPagination,
  parseQueryFilters,
} from '../utils/pagination.util';

/** Shape every faculty-owned resource shares. */
export interface OwnedResource {
  facultyId: string;
}

/**
 * The service operations a faculty-owned resource controller needs.
 */
export interface OwnedResourceService<T extends OwnedResource> {
  list(filters: QueryFilters, page: number, limit: number): Promise<{ data: T[]; meta: ListMeta }>;
  findById(id: string): Promise<T | null>;
  create(facultyId: string, data: unknown): Promise<T>;
  update(id: string, data: unknown): Promise<T>;
  remove(id: string): Promise<unknown>;
}

export interface OwnedResourceControllerOptions<T extends OwnedResource> {
  /** Human-readable resource name used in messages, e.g. `Patent`. */
  label: string;
  service: OwnedResourceService<T>;
  /** Overrides the 400 message returned when the caller has no faculty profile. */
  facultyRequiredMessage?: string;
}

export interface OwnedResourceController {
  list: (req: Request, res: Response) => Promise<void>;
  getById: (req: Request, res: Response) => Promise<void>;
  create: (req: Request, res: Response) => Promise<void>;
  update: (req: Request, res: Response) => Promise<void>;
  remove: (req: Request, res: Response) => Promise<void>;
}

/**
 * Builds the CRUD handlers shared by publications, patents, projects and
 * professional contributions: paginated listing, 404 on missing records and
 * owner-or-admin authorization on writes.
 */
export function createOwnedResourceController<T extends OwnedResource>({
  label,
  service,
  facultyRequiredMessage = 'Faculty profile required',
}: OwnedResourceControllerOptions<T>): OwnedResourceController {
  const notFoundMessage = `${label} not found`;

  const findOrRespondNotFound = async (req: Request, res: Response): Promise<T | null> => {
    const resource = await service.findById(req.params.id);
    if (!resource) {
      res.status(404).json({ success: false, message: notFoundMessage });
      return null;
    }
    return resource;
  };

  const isOwnerOrAdmin = async (req: Request, resource: T): Promise<boolean> => {
    if (req.user?.role === 'ADMIN') return true;
    const myFacultyId = await getFacultyIdFromUserId(req.user!.sub);
    return resource.facultyId === myFacultyId;
  };

  const loadWritable = async (req: Request, res: Response): Promise<T | null> => {
    const resource = await findOrRespondNotFound(req, res);
    if (!resource) return null;
    if (!(await isOwnerOrAdmin(req, resource))) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return null;
    }
    return resource;
  };

  return {
    list: async (req, res) => {
      const { page, limit } = parseListPagination(req.query);
      const result = await service.list(parseQueryFilters(req.query), page, limit);
      res.status(200).json({ success: true, ...result });
    },

    getById: async (req, res) => {
      const resource = await findOrRespondNotFound(req, res);
      if (!resource) return;
      res.status(200).json({ success: true, data: resource });
    },

    create: async (req, res) => {
      let facultyId: string | undefined = req.body.facultyId;
      if (!facultyId || req.user?.role !== 'ADMIN') {
        facultyId = await getFacultyIdFromUserId(req.user!.sub);
      }
      if (!facultyId) {
        res.status(400).json({ success: false, message: facultyRequiredMessage });
        return;
      }

      const created = await service.create(facultyId, req.body);
      res.status(201).json({ success: true, data: created });
    },

    update: async (req, res) => {
      if (!(await loadWritable(req, res))) return;
      const updated = await service.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: updated });
    },

    remove: async (req, res) => {
      if (!(await loadWritable(req, res))) return;
      await service.remove(req.params.id);
      res.status(200).json({ success: true, message: `${label} deleted` });
    },
  };
}
