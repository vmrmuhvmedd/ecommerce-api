const User = require('../models/user.model');
const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    
    if (!user) {
      logger.warn(`GetProfile | User not found | ID: ${req.user.id}`);
      return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
    }

    logger.info(`GetProfile | Retrieved profile for user ${req.user.id}`);
    return sendSuccess(res, { user }, 'Profile retrieved successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`GetProfile | ${err.message}`, err);
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { name },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      logger.warn(`UpdateProfile | User not found | ID: ${userId}`);
      return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
    }

    logger.info(`UpdateProfile | Updated profile for user ${userId}`);
    return sendSuccess(res, { user: updatedUser }, 'Profile updated successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`UpdateProfile | ${err.message}`, err);
    next(err)
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      logger.warn(`UpdatePassword | Missing current or new password | UserID: ${userId}`);
      return next(new AppError('Current and new password are required', STATUS_CODES.BAD_REQUEST));
    }

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      logger.warn(`UpdatePassword | User not found | ID: ${userId}`);
      return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
    }

    const isMatch = await user.correctPassword(currentPassword);
    if (!isMatch) {
      logger.warn(`UpdatePassword | Incorrect current password | ID: ${userId}`);
      return next(new AppError('Current password is incorrect', STATUS_CODES.UNAUTHORIZED));
    }

    user.password = newPassword;
    await user.save();

    logger.info(`UpdatePassword | Password updated for user ${userId}`);
    return sendSuccess(res, null, 'Password updated successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`UpdatePassword | ${err.message}`, err);
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`DeleteUser | User not found | ID: ${userId}`);
      return next(new AppError('User not found', STATUS_CODES.NOT_FOUND));
    }

    user.status = 'inactive';
    await user.save();

    logger.info(`DeleteUser | Deactivated user ${userId}`);
    return sendSuccess(res, null, 'User account deactivated successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`DeleteUser | ${err.message}`, err);
    next(err);
  }
};

const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin', status: 'active' }).select('-password');
    
    logger.info(`GetAllAdmins | Retrieved ${admins.length} admins`);
    return sendSuccess(res, admins, 'Admins retrieved successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`GetAllAdmins | ${err.message}`, err);
    next(err);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer', status: 'active' }).select('-password');
    
    logger.info(`GetAllCustomers | Retrieved ${customers.length} customers`);
    return sendSuccess(res, customers, 'Customers retrieved successfully', STATUS_CODES.OK);
  } catch (err) {
    logger.error(`GetAllCustomers | ${err.message}`, err);
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  deleteUser,
  getAllAdmins,
  getAllCustomers
}