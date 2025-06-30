const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/update-password', userController.updatePassword);
router.delete('/deactivate', userController.deleteUser);

router.get('/admins', authorize('admin'), userController.getAllAdmins);
router.get('/customers', authorize('admin'), userController.getAllCustomers);

module.exports = router;
