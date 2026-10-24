export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
export function fail(res, status, message) { return res.status(status).json({ message }); }
