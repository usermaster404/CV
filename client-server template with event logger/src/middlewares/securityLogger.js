const db = require('../db');

module.exports = function securityLogger(req, res, next) {
  const isAdminRoute = req.path.startsWith('/admin');
  const token = req.headers['x-user-token']; // token from login

  let user = null;
  if (token) {
    user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(token);
  }

  if (isAdminRoute && (!user || !user.is_admin)) {
    // Log forbidden access
    const stmt = db.prepare(`
      INSERT INTO security_events (event_type, user_id, ip, metadata)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      'FORBIDDEN_ACCESS',
      user ? user.id : null,
      req.ip,
      JSON.stringify({ path: req.path, method: req.method })
    );

    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }

  // Attach user to request for route handlers
  req.user = user || null;
 //pass
  next();
};
