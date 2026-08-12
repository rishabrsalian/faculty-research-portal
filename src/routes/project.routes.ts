import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from '../validation/project.schema';
import { createOwnedResourceRouter } from './owned-resource.routes';

export default createOwnedResourceRouter({
  handlers: {
    list: getProjects,
    getById: getProjectById,
    create: createProject,
    update: updateProject,
    remove: deleteProject,
  },
  schemas: {
    query: projectQuerySchema,
    create: createProjectSchema,
    update: updateProjectSchema,
  },
});
