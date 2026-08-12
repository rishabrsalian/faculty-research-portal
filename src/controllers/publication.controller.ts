import { publicationService } from '../services/publication.service';
import { createOwnedResourceController } from './owned-resource.controller';

const controller = createOwnedResourceController({
  label: 'Publication',
  facultyRequiredMessage: 'Faculty profile required to create publication',
  service: {
    list: (filters, page, limit) => publicationService.getPublications(filters, page, limit),
    findById: (id) => publicationService.getPublicationById(id),
    create: (facultyId, data) => publicationService.createPublication(facultyId, data),
    update: (id, data) => publicationService.updatePublication(id, data),
    remove: (id) => publicationService.deletePublication(id),
  },
});

export const getPublications = controller.list;
export const getPublicationById = controller.getById;
export const createPublication = controller.create;
export const updatePublication = controller.update;
export const deletePublication = controller.remove;
