import { Router } from 'express';
import authRoutes from './auth.routes';
import facultyRoutes from './faculty.routes';
import publicationRoutes from './publication.routes';
import patentRoutes from './patent.routes';
import projectRoutes from './project.routes';
import contributionRoutes from './contribution.routes';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Placeholder routers — will be replaced in Phase 5 ──────────────────────
const createPlaceholder = (name: string) => {
  const router = Router();
  router.all('*', (_req, res) => {
    res.status(501).json({
      success: false,
      message: `${name} routes are not yet implemented`,
      code: 'NOT_IMPLEMENTED',
      timestamp: new Date().toISOString(),
    });
  });
  return router;
};

// ─── Mount Routes ──────────────────────────────────────────────────────────────
apiRouter.use('/auth',                    authRoutes);
apiRouter.use('/faculty',                 facultyRoutes);
apiRouter.use('/publications',            publicationRoutes);
apiRouter.use('/patents',                 patentRoutes);
apiRouter.use('/projects',                projectRoutes);
apiRouter.use('/contributions',           contributionRoutes);

apiRouter.use('/publication-types',       createPlaceholder('Publication Types'));
apiRouter.use('/journals',                createPlaceholder('Journals'));
apiRouter.use('/conferences',             createPlaceholder('Conferences'));
apiRouter.use('/conference-contributions',createPlaceholder('Conference Contributions'));
apiRouter.use('/reports',                 createPlaceholder('Reports'));
apiRouter.use('/notifications',           createPlaceholder('Notifications'));

export default apiRouter;
