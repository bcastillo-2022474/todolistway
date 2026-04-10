import { Router } from 'express';
import pool from '../config/database';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../swagger.json';
import membersRouter from './members';
import clubsRouter from './clubs';
import eventsRouter from './events';
import adminRouter from './admin';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

router.use('/members', membersRouter);
router.use('/clubs', clubsRouter);
router.use('/events', eventsRouter);
router.use('/admin', adminRouter);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Clubs & Events API',
  swaggerOptions: { docExpansion: 'list', filter: true },
}));

export default router;