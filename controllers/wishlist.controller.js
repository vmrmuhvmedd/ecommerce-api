const Wishlist = require('../models/wishlist.model');
const logger = require('../utilities/logger.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const { sendSuccess, sendFail } = require('../utilities/response.util');
const AppError = require('../utilities/app.error.util');

const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ customer: req.user._id })
            .populate({
                path: 'products',
                model: 'Product'
            });

        if (!wishlist) {
            logger.warn(`Wishlist not found for user ${req.user._id}`);
            return next(new AppError('Wishlist not found', STATUS_CODES.NOT_FOUND));
        }

        logger.info(`Wishlist retrieved for user ${req.user._id}`);
        return sendSuccess(res, wishlist, 'Wishlist retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`Get Wishlist Error: ${err.message}`, err);
        next(err);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ customer: req.user._id, products: [productId] });
            logger.info(`Wishlist created for user ${req.user._id} with product ${productId}`);
        } else {
            if (wishlist.products.includes(productId)) {
                logger.warn(`Product ${productId} already in wishlist for user ${req.user._id}`);
                return sendFail(res, null, 'Product already in wishlist', STATUS_CODES.BAD_REQUEST);
            }
            wishlist.products.push(productId);
            await wishlist.save();
            logger.info(`Product ${productId} added to wishlist for user ${req.user._id}`);
        }

        return sendSuccess(res, null, 'Product added to wishlist', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`Add To Wishlist Error: ${err.message}`, err);
        next(err);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOneAndUpdate(
            { customer: req.user._id },
            { $pull: { products: productId } },
            { new: true }
        );

        if (!wishlist) {
            logger.warn(`Wishlist not found for user ${req.user._id} during remove`);
            return next(new AppError('Wishlist not found', STATUS_CODES.NOT_FOUND));
        }

        logger.info(`Product ${productId} removed from wishlist for user ${req.user._id}`);
        return sendSuccess(res, null, 'Product removed from wishlist', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`Remove From Wishlist Error: ${err.message}`, err);
        next(err);
    }
};

const getAllWishlistsForAdmin = async (req, res, next) => {
    try {
        const wishlists = await Wishlist.find()
            .populate({
                path: 'customer',
                select: 'name email'
            })
            .populate({
                path: 'products',
                select: 'name mainImage'
            });

        const groupedData = wishlists.map(wishlist => ({
            customer: {
                _id: wishlist.customer._id,
                name: wishlist.customer.name,
                email: wishlist.customer.email
            },
            products: wishlist.products
        }));

        logger.info(`Admin retrieved all wishlists, count: ${groupedData.length}`);
        return sendSuccess(res, groupedData, 'All wishlists retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`Get All Wishlists Error: ${err.message}`, err);
        next(err);
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getAllWishlistsForAdmin
}