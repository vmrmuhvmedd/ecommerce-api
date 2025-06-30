const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const User = require('../models/user.model');
const logger = require('../utilities/logger.util');

const addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            logger.warn(`AddAddress | User not found | ID: ${req.user.id}`);
            return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
        }
        const newAddress = req.body;
        logger.info(`AddAddress | Adding new address for user ${req.user.id}`);

        if (user.addresses.length === 0) newAddress.isDefault = true;

        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        logger.debug(`AddAddress | Address added successfully | ${JSON.stringify(newAddress)}`);

        return sendSuccess(res, newAddress, 'Address added successfully', STATUS_CODES.CREATED);
    } catch (err) {
        logger.error(`AddAddress | ${err.message}`, err);
        next(err);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            logger.warn(`Update Address: User not found | UserID: ${req.user.id}`);
            return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
        }



        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            logger.warn(`Update Address: Address not found | AddressID: ${req.params.addressId}`);
            return next(new AppError('Address not found', STATUS_CODES.NOT_FOUND));
        }

        Object.keys(req.body).forEach(key => {
            if (key !== 'isDefault') address[key] = req.body[key];
        });

        if (req.body.isDefault === true) {
            user.addresses.forEach(addr => addr.isDefault = addr._id.equals(address._id));
        }

        await user.save();

        return sendSuccess(res, address, 'Address updated successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`Update Address Error: ${err.message}`, err);
        next(err);
    }
};

const softDeleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            logger.warn(`Soft Delete Address: User not found | UserID: ${req.user.id}`);
            return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
        }

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            logger.warn(`Soft Delete Address: Address not found | AddressID: ${req.params.addressId}`);
            return next(new AppError('Address not found', STATUS_CODES.NOT_FOUND));
        }

        address.set('street', '[deleted]');
        address.set('isDefault', false);

        await user.save();

        logger.info(`Address soft deleted | UserID: ${req.user.id}, AddressID: ${address._id}`);

        return sendSuccess(res, null, 'Address deleted successfully', STATUS_CODES.NOT_FOUND);
    } catch (err) {
        logger.error(`Soft Delete Address Error: ${err.message}`, err);
        next(err)
    }
};

const setDefaultAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
logger.warn(`Set Default Address: User not found | UserID: ${req.user.id}`);
            return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
        }

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            logger.warn(`Set Default Address: Address not found | AddressID: ${req.params.addressId}`);
            return next(new AppError('Address not found', STATUS_CODES.NOT_FOUND));
        }

        user.addresses.forEach(addr => addr.isDefault = addr._id.equals(address._id));

        await user.save();

        logger.info(`Default address set | UserID: ${req.user.id}, AddressID: ${address._id}`);

        return sendSuccess(res, address, 'Default address set successfully');
    } catch (err) {
        logger.error(`Set Default Address Error: ${err.message}`, err);
        next(err)
    }
};

module.exports = {
    addAddress,
    updateAddress,
    softDeleteAddress,
    setDefaultAddress
}