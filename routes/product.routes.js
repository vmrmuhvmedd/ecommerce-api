const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const paginate = require('../middleware/paginate.middleware');
const filter = require('../middleware/filter.middleware');

const Product = require('../models/product.model');

router.get(
    '/admin/all',
    authenticate,
    authorize('admin'),
    (req, res, next) => {
        req.model = Product;
        next();
    },
    filter(['brand', 'category', 'gender']),
    paginate(Product),
    productController.getAllProductsAdmin
);

router.get(
    '/',
    (req, res, next) => {
        req.model = Product;
        next();
    },
    filter(['brand', 'category', 'gender']),
    paginate(Product),
    productController.getAllProducts
);


router.get('/:id', authenticate.optional, productController.getProductById);

router.post(
    '/',
    authenticate,
    authorize('admin'),
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'images', maxCount: 20 }
    ]),
    productController.createProduct
);

router.patch(
    '/:id/restore',
    authenticate,
    authorize('admin'),
    productController.restoreProduct
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'images', maxCount: 20 }
    ]),
    productController.updateProduct
);

router.delete('/:id', authenticate, authorize('admin'), productController.softDeleteProduct);

module.exports = router;
