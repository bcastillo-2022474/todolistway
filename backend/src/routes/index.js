const { Router } = require('express');
const todosRouter = require('./todos');

const router = Router();

router.get('/health', async (req, res) => {
  const db = req.app.get('db');
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

router.use('/todos', todosRouter);

module.exports = router;
