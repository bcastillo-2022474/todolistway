/**
 * Central error-handling middleware.
 * Must be registered after all routes (4 arguments = error handler in Express).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
