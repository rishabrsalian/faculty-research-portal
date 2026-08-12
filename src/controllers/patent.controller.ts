import { patentService } from '../services/patent.service';
import { createOwnedResourceController } from './owned-resource.controller';

const controller = createOwnedResourceController({
  label: 'Patent',
  service: {
    list: (filters, page, limit) => patentService.getPatents(filters, page, limit),
    findById: (id) => patentService.getPatentById(id),
    create: (facultyId, data) => patentService.createPatent(facultyId, data),
    update: (id, data) => patentService.updatePatent(id, data),
    remove: (id) => patentService.deletePatent(id),
  },
});

export const getPatents = controller.list;
export const getPatentById = controller.getById;
export const createPatent = controller.create;
export const updatePatent = controller.update;
export const deletePatent = controller.remove;
