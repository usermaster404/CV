const db = require('./index');

const rows = db.prepare(`
  SELECT id, event_type, user_id, ip, metadata, created_at
  FROM security_events
  ORDER BY id DESC
  LIMIT 5
`).all();

console.table(rows);
