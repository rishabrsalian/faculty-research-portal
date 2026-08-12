import { contributionService } from '../services/contribution.service';
import { createOwnedResourceController } from './owned-resource.controller';

const controller = createOwnedResourceController({
  label: 'Contribution',
  service: {
    list: (filters, page, limit) => contributionService.getContributions(filters, page, limit),
    findById: (id) => contributionService.getContributionById(id),
    create: (facultyId, data) => contributionService.createContribution(facultyId, data),
    update: (id, data) => contributionService.updateContribution(id, data),
    remove: (id) => contributionService.deleteContribution(id),
  },
});

export const getContributions = controller.list;
export const getContributionById = controller.getById;
export const createContribution = controller.create;
export const updateContribution = controller.update;
export const deleteContribution = controller.remove;
