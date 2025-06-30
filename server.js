const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const corsHandler = require('./middleware/cors.middleware');
const connectDB = require('./config/db.config');
const logger = require('./utilities/logger.util');

// Route imports
const { scheduleBackup } = require('./services/backup.service');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const addressRoutes = require('./routes/address.routes');
const productRoutes = require('./routes/product.routes');
const brandRoutes = require('./routes/brand.routes');
const categoryRoutes = require('./routes/category.routes');
const colorRoutes = require('./routes/color.routes');
const sizeRoutes = require('./routes/size.routes');
const cartRoutes = require('./routes/cart.routes');
const removedCartRoutes = require('./routes/removedCart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const backupRouter = require('./routes/backup.routes');
const errorHandler = require('./middleware/errorHandler.middleware');
const AppError = require('./utilities/app.error.util');

dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(`${err.name}: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(corsHandler);
app.use(express.json());
app.use('/img', express.static(path.join(__dirname, 'uploads')));

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/removed-cart', removedCartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', backupRouter);

scheduleBackup()

// 404 Handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
