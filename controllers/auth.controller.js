const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Customer = require('../models/customer.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendSuccess, sendFail } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const logger = require('../utilities/logger.util');


const generateSessionId = () => crypto.randomBytes(16).toString('hex');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId: generateSessionId()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      algorithm: 'HS256'
    }
  );
};

const register = async (req, res, next) => {
  try {
    let { name, email, phone, password, addresses, address, gender } = req.body;

    const errors = {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.name = 'Name is required and must be a string';
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      errors.email = 'Email is required and must be a string';
    }
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      errors.phone = 'Phone is required and must be a string';
    }
    if (!password || typeof password !== 'string' || password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!gender || !['Male', 'Female'].includes(gender)) errors.gender = 'Gender is required (Male or Female)';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) errors.email = 'Invalid email format';

    const phoneRegex = /^01[0125]\d{8}$/;
    if (phone && !phoneRegex.test(phone)) errors.phone = 'Invalid Egyptian phone number';

    if (Object.keys(errors).length > 0) {
      logger.warn(`Register | Validation errors | ${JSON.stringify(errors)}`);
      return sendFail(res, errors, 'Validation errors', STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) errors.email = 'Email already exists';
      if (existingUser.phone === phone) errors.phone = 'Phone already exists';

      logger.warn(`Register | Duplicate fields | ${JSON.stringify(errors)}`);
      return sendFail(res, errors, 'Duplicate fields', STATUS_CODES.BAD_REQUEST);
    }

    if (!addresses && address) {
      addresses = [address];
    }

    const formattedAddresses = addresses && addresses.length > 0
      ? addresses.map((addr, index) => ({
        ...addr,
        isDefault: index === 0
      }))
      : [];

    const customer = await Customer.create({
      name,
      email,
      phone,
      password,
      gender,
      addresses: formattedAddresses
    });

    logger.info(`Register | New user registered | ID: ${customer._id} | Email: ${email}`);

    return sendSuccess(res, null, 'Registration successful. Please login now.', STATUS_CODES.CREATED);

  } catch (err) {
    if (err.name === 'ValidationError') {
      const mongooseErrors = {};
      Object.values(err.errors).forEach(e => mongooseErrors[e.path] = e.message);
      logger.error(`Register | Mongoose validation failed | ${JSON.stringify(mongooseErrors)}`);
      return sendFail(res, mongooseErrors, 'Mongoose validation failed', STATUS_CODES.BAD_REQUEST);
    }

    logger.error(`Register | ${err.message}`, err);
    next(err)
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const newAdmin = await Admin.create({
      name,
      email,
      phone,
      password,
      role: 'admin'
    });

    logger.info(`CreateAdmin | New admin created | ID: ${newAdmin._id} | Email: ${email}`);
    return sendSuccess(res, {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role
    }, 'Admin created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    logger.error(`CreateAdmin | ${err.message}`, err);
    next(err)
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login | Email and password are required');
      return sendFail(res, [], 'Email and password are required', STATUS_CODES.BAD_REQUEST);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      logger.warn(`Login | Invalid credentials | Email: ${email}`);
      return sendFail(res, [], 'Invalid email or password', STATUS_CODES.UNAUTHORIZED);
    }

    if (user.status !== 'active') {
      logger.warn(`Login | Inactive user | Email: ${email}`);
      return sendFail(res, [], 'User account is inactive', STATUS_CODES.UNAUTHORIZED);
    }

    const token = signToken(user);

    logger.info(`Login | User logged in | ID: ${user._id} | Email: ${email}`);

    return sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || []
      }
    }, 'Login successful', STATUS_CODES.OK);

  } catch (err) {
    logger.error(`Login | ${err.message}`, err);
    next(err);
  }
};

module.exports = {
  register,
  login,
  createAdmin
}
