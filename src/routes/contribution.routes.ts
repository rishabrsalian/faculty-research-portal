import { getContributions, getContributionById, createContribution, updateContribution, deleteContribution } from '../controllers/contribution.controller';
import { createContributionSchema, updateContributionSchema, contributionQuerySchema } from '../validation/contribution.schema';
import { createOwnedResourceRouter } from './owned-resource.routes';

export default createOwnedResourceRouter({
  handlers: {
    list: getContributions,
    getById: getContributionById,
    create: createContribution,
    update: updateContribution,
    remove: deleteContribution,
  },
  schemas: {
    query: contributionQuerySchema,
    create: createContributionSchema,
    update: updateContributionSchema,
  },
});
