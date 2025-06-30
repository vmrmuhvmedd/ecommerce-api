const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/add', authenticate, wishlistController.addToWishlist);
router.delete('/remove/:productId', authenticate, wishlistController.removeFromWishlist);

router.get('/admin/all', authenticate, authorize('admin'), wishlistController.getAllWishlistsForAdmin);

module.exports = router;