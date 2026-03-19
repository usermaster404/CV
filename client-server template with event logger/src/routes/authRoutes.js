const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare(`
    SELECT id, username, is_admin
    FROM users
    WHERE username = ? AND password = ?
  `);

  const user = stmt.get(username, password);

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // For demo, we just return a "token" which is user id
  const token = user.id;

  res.json({ message: 'Login successful', token, is_admin: user.is_admin });
});

module.exports = router;
