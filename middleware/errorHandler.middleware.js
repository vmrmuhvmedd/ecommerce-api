const logger = require('../utilities/logger.util');
const STATUS_CODES = require('../utilities/response.codes.util');

const responsesStatus = require('../utilities/responses.status.util');

const globalErrorHandler = (err, req, res, next) => {
    logger.error(err);

    err.statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    err.status = err.status || responsesStatus.ERROR;

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: responsesStatus.ERROR,
        message: process.env.NODE_ENV === 'development'
            ? err.stack
            : 'Something went wrong!'
    });
};

module.exports = globalErrorHandler;
