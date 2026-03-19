const db = require('./index');

const insert = db.prepare(`
  INSERT INTO metrics_requests (method, path, status_code, response_time_ms, ip)
  VALUES (?, ?, ?, ?, ?)
`);

insert.run('GET', '/health', 200, 12, '127.0.0.1');

const rows = db.prepare(`
  SELECT * FROM metrics_requests
`).all();

console.log(rows);
