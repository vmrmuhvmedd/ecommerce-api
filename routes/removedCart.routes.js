const express = require('express');
const router = express.Router();
const removedCartController = require('../controllers/removedCart.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/admin/removed', authenticate, authorize('admin'), removedCartController.getRemovedItems);

module.exports = router;
