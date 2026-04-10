import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import pool from './config/database';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database tables ready');
  } catch (err) {
    console.error('Migration failed:', err);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

export default app;
