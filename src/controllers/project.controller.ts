import { projectService } from '../services/project.service';
import { createOwnedResourceController } from './owned-resource.controller';

const controller = createOwnedResourceController({
  label: 'Project',
  service: {
    list: (filters, page, limit) => projectService.getProjects(filters, page, limit),
    findById: (id) => projectService.getProjectById(id),
    create: (facultyId, data) => projectService.createProject(facultyId, data),
    update: (id, data) => projectService.updateProject(id, data),
    remove: (id) => projectService.deleteProject(id),
  },
});

export const getProjects = controller.list;
export const getProjectById = controller.getById;
export const createProject = controller.create;
export const updateProject = controller.update;
export const deleteProject = controller.remove;
