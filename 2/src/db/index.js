const Database = require('better-sqlite3');
const path = require('path');

// creates a file like ./data/analytics.db
const dbPath = path.join(__dirname, '../../data/analytics.db');

const db = new Database(dbPath, {
  verbose: console.log // logs SQL queries (great for debugging)
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

module.exports = db;
