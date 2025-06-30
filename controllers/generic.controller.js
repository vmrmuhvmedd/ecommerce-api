const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');


const createOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.create(req.body);
        logger.info(`CreateOne | ${Model.modelName} | Created | ID: ${doc._id}`);
        return sendSuccess(res, doc, 'Created successfully', STATUS_CODES.CREATED);
    } catch (err) {
        logger.error(`CreateOne | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

const getAll = (Model) => async (req, res, next) => {
    try {
        const docs = await Model.find({ isActive: { $ne: false } });
        logger.info(`GetAll | ${Model.modelName} | Count: ${docs.length}`);
        return sendSuccess(res, docs, 'All items retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetAll | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

const getOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
            logger.warn(`GetOne | ${Model.modelName} | Not found | ID: ${req.params.id}`);
            return next(new AppError('Item not found', STATUS_CODES.NOT_FOUND));
        }
        logger.info(`GetOne | ${Model.modelName} | Retrieved | ID: ${doc._id}`);
        return sendSuccess(res, doc, 'Item retrieved successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`GetOne | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

const updateOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) {
            logger.warn(`UpdateOne | ${Model.modelName} | Not found | ID: ${req.params.id}`);
            return next(new AppError('Item not found', STATUS_CODES.NOT_FOUND));
        }
        logger.info(`UpdateOne | ${Model.modelName} | Updated | ID: ${doc._id}`);
        return sendSuccess(res, doc, 'Updated successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`UpdateOne | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

const softDeleteOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!doc) {
            logger.warn(`SoftDeleteOne | ${Model.modelName} | Not found | ID: ${req.params.id}`);
            return next(new AppError('Item not found', STATUS_CODES.NOT_FOUND));
        }
        logger.info(`SoftDeleteOne | ${Model.modelName} | Soft deleted | ID: ${doc._id}`);
        return sendSuccess(res, null, 'Deleted successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`SoftDeleteOne | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

const restoreOne = (Model) => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        if (!doc) {
            logger.warn(`RestoreOne | ${Model.modelName} | Not found | ID: ${req.params.id}`);
            return next(new AppError('Item not found', STATUS_CODES.NOT_FOUND));
        }
        logger.info(`RestoreOne | ${Model.modelName} | Restored | ID: ${doc._id}`);
        return sendSuccess(res, doc, 'Restored successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error(`RestoreOne | ${Model.modelName} | ${err.message}`, err);
        next(err)
    }
};

module.exports = {
    getAll,
    createOne,
    getOne,
    updateOne,
    softDeleteOne,
    restoreOne
}
