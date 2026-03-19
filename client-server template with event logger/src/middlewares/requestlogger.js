const db = require('../db');

module.exports = function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const stmt = db.prepare(`
      INSERT INTO metrics_requests
        (method, path, status_code, response_time_ms, ip)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.ip
    );
  });

  next();
};
