const User = require('../models/usermodel');
const AggregationService = require('../services/agregationservice');

const UserController = {
  async getUsers(req, res) {
    try {
      const users = await User.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getUserStats(req, res) {
    try {
      const stats = await AggregationService.getUserStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createUser(req, res) {
    try {
      const user = await User.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = UserController;
