require('dotenv').config();

const express = require('express');
const pool = require('./config/database');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// Make db pool available to routes via app.get('db')
app.set('db', pool);

app.use(express.json());

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
