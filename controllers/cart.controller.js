const CartItem = require('../models/cart.model');
const Product = require('../models/product.model');
const RemovedCartItem = require('../models/removedCart.model');
const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');

const getCart = async (req, res, next) => {
    try {
        const cartItems = await CartItem.find({ customer: req.user._id })
            .populate('product', 'name mainImage')
            .populate('size', 'name');

        logger.info(`GetCart | UserID: ${req.user._id} | Items retrieved: ${cartItems.length}`);
        return sendSuccess(res, cartItems, 'Cart retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetCart | ${err.message}`, err);
        next(err)
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { product, size, quantity, priceAtAdding } = req.body;

        const fullProduct = await Product.findById(product);

        if (!fullProduct || !fullProduct.isAvailable) {
            logger.warn(`AddToCart | Product not found or unavailable | ProductID: ${product}`);
            return next(new AppError('Product not found or not available', STATUS_CODES.NOT_FOUND));
        }

        const variant = fullProduct.variants.find(
            (v) => v.size.toString() === size
        );

        if (!variant) {
            logger.warn(`AddToCart | Variant not found | ProductID: ${product} | Size: ${size}`);
            return next(new AppError('Variant not found', STATUS_CODES.BAD_REQUEST));
        }

        let existingQuantity = 0;

        const existingItem = await CartItem.findOne({
            customer: req.user._id,
            product,
            size
        });

        if (existingItem) existingQuantity = existingItem.quantity;

        if ((existingQuantity + quantity) > variant.stock) {
            logger.warn(`AddToCart | Exceeds stock | ProductID: ${product} | Requested: ${quantity} | Available: ${variant.stock - existingQuantity}`);
            return next(new AppError(`Only ${variant.stock - existingQuantity} items left in stock`, STATUS_CODES.BAD_REQUEST));
        }

        let cartItem;
        if (existingItem) {
            existingItem.quantity += quantity;
            cartItem = await existingItem.save();
        } else {
            cartItem = await CartItem.create({
                customer: req.user._id,
                product,
                size,
                quantity,
                priceAtAdding
            });
            logger.info(`AddToCart | New item added | ID: ${cartItem._id}`);
        }

        return sendSuccess(res, cartItem, 'Item added to cart', STATUS_CODES.CREATED);

    } catch (err) {
        logger.error(`AddToCart | ${err.message}`, err);
        next(err);
    }
};

const updateQuantity = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        const cartItem = await CartItem.findOne({
            _id: req.params.id,
            customer: req.user._id
        });

        if (!cartItem) {
            logger.warn(`UpdateQuantity | Cart item not found | ID: ${req.params.id}`);
            return next(new AppError('Cart item not found', STATUS_CODES.NOT_FOUND));
        }

        const fullProduct = await Product.findById(cartItem.product);
        const variant = fullProduct.variants.find(
            (v) => v.size.toString() === cartItem.size.toString()
        );

        if (!variant || quantity > variant.stock) {
            logger.warn(`UpdateQuantity | Exceeds stock | Requested: ${quantity} | Available: ${variant?.stock || 0}`);
            return next(new AppError(`Only ${variant?.stock || 0} items available in stock`, STATUS_CODES.BAD_REQUEST));
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        logger.info(`UpdateQuantity | Updated quantity | ID: ${cartItem._id} | Quantity: ${quantity}`);
        return sendSuccess(res, cartItem, 'Cart item quantity updated', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`UpdateQuantity | ${err.message}`, err);
        next(err);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const cartItem = await CartItem.findOne({
            _id: req.params.id,
            customer: req.user._id
        });

        if (!cartItem) {
            logger.warn(`RemoveFromCart | Cart item not found | ID: ${req.params.id}`);
            return next(new AppError('Cart item not found', STATUS_CODES.NOT_FOUND));
        }

        await RemovedCartItem.create({
            customer: cartItem.customer,
            product: cartItem.product,
            size: cartItem.size,
            quantity: cartItem.quantity,
            priceAtRemoving: cartItem.priceAtAdding
        });

        await CartItem.deleteOne({ _id: cartItem._id });

        logger.info(`RemoveFromCart | Item removed | ID: ${cartItem._id}`);
        return sendSuccess(res, null, 'Item removed and logged', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`RemoveFromCart | ${err.message}`, err);
        next(err);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const cartItems = await CartItem.find({ customer: req.user._id });

        if (cartItems.length === 0) {
            logger.info(`ClearCart | Cart already empty | UserID: ${req.user._id}`);
            return sendSuccess(res, null, 'Cart already empty', STATUS_CODES.OK);
        }

        const removedItems = cartItems.map(item => ({
            customer: item.customer,
            product: item.product,
            size: item.size,
            quantity: item.quantity,
            priceAtRemoving: item.priceAtAdding,
            removedAt: new Date()
        }));

        await RemovedCartItem.insertMany(removedItems);

        await CartItem.deleteMany({ customer: req.user._id });

        logger.info(`ClearCart | Cart cleared | UserID: ${req.user._id} | Items removed: ${cartItems.length}`);
        return sendSuccess(res, null, 'Cart cleared and removed items saved', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`ClearCart | ${err.message}`, err);
        next(err);
    }
};

const syncCart = async (req, res, next) => {
    try {
        const { items } = req.body;
        const customerId = req.user._id;

        if (!Array.isArray(items)) {
            logger.warn(`SyncCart | Items must be array | UserID: ${customerId}`);
            return next(new AppError('Items must be an array', STATUS_CODES.BAD_REQUEST));
        }

        for (const item of items) {
            const { product, size, quantity, priceAtAdding } = item;

            const existing = await CartItem.findOne({
                customer: customerId,
                product,
                size
            });

            if (existing) {
                existing.quantity += quantity;
                await existing.save();
                logger.debug(`SyncCart | Updated existing | ID: ${existing._id} | Quantity: ${existing.quantity}`);
            } else {
                await CartItem.create({
                    customer: customerId,
                    product,
                    size,
                    quantity,
                    priceAtAdding
                });
                logger.debug(`SyncCart | Added new item | ID: ${created._id}`);
            }
        }

        logger.info(`SyncCart | Cart synced successfully | UserID: ${customerId}`);
        return sendSuccess(res, null, 'Cart synced successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`SyncCart | ${err.message}`, err);
        next(err);
    }
};

const getAllCartsForAdmin = async (req, res, next) => {
    try {
        const cartItems = await CartItem.find()
            .populate('customer', 'name email')
            .populate('product', 'name mainImage')
            .populate('size', 'name');

        const grouped = {};

        cartItems.forEach(item => {
            const customerId = item.customer._id.toString();

            if (!grouped[customerId]) {
                const cleanCustomer = { ...item.customer.toObject() };
                delete cleanCustomer.id;

                grouped[customerId] = {
                    customer: cleanCustomer,
                    items: []
                };
            }

            grouped[customerId].items.push({
                product: item.product,
                size: item.size,
                quantity: item.quantity,
                priceAtAdding: item.priceAtAdding,
                createdAt: item.createdAt
            });
        });

        const result = Object.values(grouped);

        logger.info(`GetAllCartsForAdmin | Total customers: ${result.length}`);
        return sendSuccess(res, result, 'All carts retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetAllCartsForAdmin | ${err.message}`, err);
        next(err);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCart,
    getAllCartsForAdmin
}

