const db = require('../db');

const User = {
  async getAllUsers() {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  },

  async getUserById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createUser(user) {
    const { name, email } = user;
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }
};

module.exports = User;
