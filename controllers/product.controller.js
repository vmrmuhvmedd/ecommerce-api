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
        const query = req.baseQuery ? req.baseQuery.where({ isAvailable: true }) : Product.find({ isAvailable: true });

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
        const productId = req.params.id;
        const updates = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            logger.warn(`UpdateProduct | Not found | ID: ${productId}`);
            return next(new AppError('Product not found', STATUS_CODES.NOT_FOUND));
        }

        if (updates.deletedImages) {
            const imagesToDelete = JSON.parse(updates.deletedImages);
            product.images = product.images.filter(img => !imagesToDelete.includes(img));
        }

        if (req.files?.mainImage) {
            product.mainImage = req.files.mainImage[0].filename;
        }

        if (req.files?.images) {
            const newImages = req.files.images.map(file => file.filename);
            product.images.push(...newImages);
        }

        product.name = updates.name || product.name;
        product.description = updates.description || product.description;
        product.gender = updates.gender || product.gender;
        product.category = updates.category || product.category;
        product.brand = updates.brand || product.brand;

        if (updates.variants) {
            product.variants = JSON.parse(updates.variants);
        }

        await product.save();

        logger.info(`UpdateProduct | Updated successfully | ID: ${product._id}`);
        return sendSuccess(res, product, 'Product updated successfully', STATUS_CODES.OK);

    } catch (err) {
        logger.error(`UpdateProduct | ${err.message}`, err);
        next(new AppError('Failed to update product', STATUS_CODES.INTERNAL_SERVER_ERROR));
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
