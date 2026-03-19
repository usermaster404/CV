const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usercontroller');

router.get('/', UserController.getUsers);
router.get('/stats', UserController.getUserStats);
router.post('/', UserController.createUser);

module.exports = router;
