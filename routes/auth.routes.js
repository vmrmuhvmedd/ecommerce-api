const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authorize = require('../middleware/role.middleware');
const authenticate = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin', authenticate, authorize('admin'), authController.createAdmin); // admin only

module.exports = router;
