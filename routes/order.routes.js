// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/order.controller');
// const { authenticate, authorize } = require('../middleware/auth.middleware');

// router.post('/checkout', authenticate, authorize('customer'), orderController.checkout);

// router.get('/my-orders', authenticate, authorize('customer'), orderController.getMyOrders);

// router.get('/', authenticate, authorize('admin'), orderController.getAllOrders);

// router.patch('/:orderId/status', authenticate, authorize('admin'), orderController.updateOrderStatus);

// router.patch('/:orderId/cancel', authenticate, authorize('customer'), orderController.cancelOrder);

// router.patch('/:orderId/return', authenticate, authorize('admin'), orderController.markAsReturned);

// module.exports = router;