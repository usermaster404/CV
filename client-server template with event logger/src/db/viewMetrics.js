const db = require('./index');

const rows = db.prepare(`
  SELECT id, method, path, status_code, response_time_ms, ip, created_at
  FROM metrics_requests
  ORDER BY id DESC
  LIMIT 5
`).all();

console.table(rows);
