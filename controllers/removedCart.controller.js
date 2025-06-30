const RemovedCartItem = require('../models/removedCart.model');
const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');


const getRemovedItems = async (req, res, next) => {
    try {
        const removedItems = await RemovedCartItem.find()
            .populate('customer', 'name email')
            .populate('product', 'name mainImage')
            .populate('size', 'name')
            .sort({ removedAt: -1 });

        const grouped = {};

        for (const item of removedItems) {
            const customerId = item.customer._id.toString();

            if (!grouped[customerId]) {
                grouped[customerId] = {
                    customer: item.customer,
                    removedItems: []
                };
            }

            grouped[customerId].removedItems.push({
                product: item.product,
                size: item.size,
                quantity: item.quantity,
                priceAtRemoving: item.priceAtRemoving,
                removedAt: item.removedAt
            });
        }

        const groupedArray = Object.values(grouped);

        logger.info(`GetRemovedItems | Retrieved | Groups: ${groupedArray.length}, Total Items: ${removedItems.length}`);

        return sendSuccess(res, groupedArray, 'Removed items retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetRemovedItems | ${err.message}`, err);
        next(err);
    }
};

module.exports = {
    getRemovedItems
}
