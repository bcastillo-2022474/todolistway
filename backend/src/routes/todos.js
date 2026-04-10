const { Router } = require('express');

const router = Router();

// GET /api/todos
router.get('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/todos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query('SELECT * FROM todos WHERE id = $1', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Todo not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/todos
router.post('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const { rows } = await db.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/todos/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { title, completed } = req.body;

    const { rows } = await db.query(
      `UPDATE todos
       SET
         title     = COALESCE($1, title),
         completed = COALESCE($2, completed)
       WHERE id = $3
       RETURNING *`,
      [title, completed, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Todo not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { rowCount } = await db.query('DELETE FROM todos WHERE id = $1', [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: 'Todo not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
