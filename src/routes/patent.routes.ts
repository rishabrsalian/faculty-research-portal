import { getPatents, getPatentById, createPatent, updatePatent, deletePatent } from '../controllers/patent.controller';
import { createPatentSchema, updatePatentSchema, patentQuerySchema } from '../validation/patent.schema';
import { createOwnedResourceRouter } from './owned-resource.routes';

export default createOwnedResourceRouter({
  handlers: {
    list: getPatents,
    getById: getPatentById,
    create: createPatent,
    update: updatePatent,
    remove: deletePatent,
  },
  schemas: {
    query: patentQuerySchema,
    create: createPatentSchema,
    update: updatePatentSchema,
  },
});
