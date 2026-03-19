const db = require('../db');

const AggregationService = {
  async getUserStats() {
    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    const emails = await db.query('SELECT email FROM users');

    return {
      totalUsers: parseInt(totalUsers.rows[0].count),
      allEmails: emails.rows.map(row => row.email),
    };
  },

  async getCustomAggregation() {
    // Example: aggregate data from multiple tables
    const result = await db.query(`
      SELECT u.id, u.name, COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.name
    `);

    return result.rows;
  }
};

module.exports = AggregationService;
