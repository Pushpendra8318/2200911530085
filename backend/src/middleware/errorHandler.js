export default function errorHandler(err, req, res, next) {
  // generic error handler: returns 500 + message
  // hide internal details in production if needed
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
}