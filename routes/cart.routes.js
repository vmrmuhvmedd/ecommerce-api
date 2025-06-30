const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/add', authenticate, cartController.addToCart);

router.get('/', authenticate, cartController.getCart);

router.put('/update/:id', authenticate, cartController.updateQuantity);

router.delete('/remove/:id', authenticate, cartController.removeFromCart);

router.delete('/clear', authenticate, cartController.clearCart);

router.post('/sync', authenticate, cartController.syncCart);

router.get('/admin/all', authenticate, authorize('admin'), cartController.getAllCartsForAdmin);

module.exports = router;
