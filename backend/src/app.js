require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const pool = require('./config/database');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

async function initDatabase() {
  const { rows } = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'member') AS exists"
  );

  if (rows[0].exists) {
    console.log('La base de datos ya está inicializada, saltando init.sql');
    return;
  }

  const sql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf8');
  await pool.query(sql);
  console.log('Init SQL ejecutado');
}

initDatabase()
  .catch((err) => {
    console.error('Error ejecutando init.sql:', err);
    process.exit(1);
  });

app.set('db', pool);
app.use(express.json());
app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
