const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');

const deleteUploadedFiles = (files) => {
    if (!files) return;

    Object.values(files).flat().forEach(file => {
        const filePath = path.join(__dirname, '..', 'uploads', 'products', file.filename);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete file:', file.filename);
        });
    });
};

const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            gender,
            category,
            brand,
            variants,
            isAvailable
        } = req.body;

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            deleteUploadedFiles(req.files);
            logger.warn(`CreateProduct | Product already exists | Name: ${name}`);
            return next(new AppError('Product with this name already exists', STATUS_CODES.BAD_REQUEST));
        }

        const productData = {
            name,
            description,
            gender,
            category,
            brand,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            variants: variants ? JSON.parse(variants) : [],
            mainImage: req.files?.mainImage?.[0]?.filename,
            images: req.files?.images?.map(file => file.filename)
        };

        const product = await Product.create(productData);
        
        logger.info(`CreateProduct | Created successfully | ID: ${product._id}`);
        return sendSuccess(res, product, 'Product created successfully', STATUS_CODES.CREATED);
    } catch (err) {
        logger.error(`CreateProduct | ${err.message}`, err);
        next(err);
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const query = req.baseQuery.where({ isAvailable: true });

        const products = await query.populate([
            { path: 'brand', select: 'name' },
            { path: 'category', select: 'name' },
            { path: 'variants.color', select: 'name hex' },
            { path: 'variants.size', select: 'name' }
        ]);

        logger.info(`GetAllProducts | Retrieved | Count: ${products.length}`);

        if (req.pagination) {
            req.pagination.data = products;
            return res.status(200).json({
                status: 'success',
                ...req.pagination
            });
        }

        return sendSuccess(res, products, 'All products retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetAllProducts | ${err.message}`, err);
        next(err);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate([
            { path: 'brand', select: 'name' },
            { path: 'category', select: 'name' },
            { path: 'variants.color', select: 'name hex' },
            { path: 'variants.size', select: 'name' }
        ]);

        if (!product) {
            logger.warn(`GetProductById | Not found | ID: ${req.params.id}`);
            return next(new AppError('Product not found', STATUS_CODES.NOT_FOUND));
        }

        const isAdmin = req.user?.role === 'admin';
        if (!isAdmin && !product.isAvailable) {
            logger.warn(`GetProductById | Product not available | ID: ${product._id}`);
            return next(new AppError('This product is not available', STATUS_CODES.FORBIDDEN));
        }

        logger.info(`GetProductById | Retrieved | ID: ${product._id}`);
        return sendSuccess(res, product, 'Product retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetProductById | ${err.message}`, err);
        next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const updates = req.body;
        if (req.files?.mainImage) {
            updates.mainImage = req.files.mainImage[0].filename;
        }

        if (req.files?.images) {
            updates.images = req.files.images.map(file => file.filename);
        }

        if (updates.variants) {
            updates.variants = JSON.parse(updates.variants);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            logger.warn(`UpdateProduct | Not found | ID: ${req.params.id}`);
            return next(new AppError('Product not found', STATUS_CODES.NOT_FOUND));
        }

        logger.info(`UpdateProduct | Updated | ID: ${updatedProduct._id}`);
        return sendSuccess(res, updatedProduct, 'Product updated successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`UpdateProduct | ${err.message}`, err);
        next(err);
    }
};

const softDeleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isAvailable: false },
            { new: true }
        );

        if (!product) {
            logger.warn(`SoftDeleteProduct | Not found | ID: ${req.params.id}`);
            return next(new AppError('Product not found', STATUS_CODES.NOT_FOUND));
        }

        logger.info(`SoftDeleteProduct | Marked as unavailable | ID: ${product._id}`);
        return sendSuccess(res, null, 'Product marked as unavailable', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`SoftDeleteProduct | ${err.message}`, err);
        next(err);
    }
};

const restoreProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isAvailable: true },
            { new: true }
        );

        if (!product) {
            logger.warn(`RestoreProduct | Not found | ID: ${req.params.id}`);
            return next(new AppError('Product not found', STATUS_CODES.NOT_FOUND));
        }

        logger.info(`RestoreProduct | Restored | ID: ${product._id}`);
        return sendSuccess(res, product, 'Product restored successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`RestoreProduct | ${err.message}`, err);
        next(err);
    }
};

const getAllProductsAdmin = async (req, res, next) => {
    try {
        const query = req.baseQuery;

        const products = await query
            .populate([
                { path: 'brand', select: 'name' },
                { path: 'category', select: 'name' },
                { path: 'variants.color', select: 'name hex' },
                { path: 'variants.size', select: 'name' }
            ])
            .sort({ createdAt: -1 });

        logger.info(`GetAllProductsAdmin | Retrieved | Count: ${products.length}`);

        if (req.pagination) {
            req.pagination.data = products;
            return res.status(200).json({
                status: 'success',
                ...req.pagination
            });
        }

        return sendSuccess(res, products, 'All products retrieved for admin successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetAllProductsAdmin | ${err.message}`, err);
        next(err);
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    softDeleteProduct,
    restoreProduct,
    getAllProductsAdmin
}
