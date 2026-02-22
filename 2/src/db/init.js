const db = require('./index');

db.exec(`
INSERT INTO users (username, password, is_admin)
VALUES ('admin', 'admin123', 1);

`);

console.log('SQLite tables initialized (including user_sessions)');
