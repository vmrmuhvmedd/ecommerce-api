const { createBackup, restoreBackup } = require('../services/backup.service');
const { sendSuccess } = require('../utilities/response.util');
const STATUS_CODES = require('../utilities/response.codes.util');
const AppError = require('../utilities/app.error.util');
const logger = require('../utilities/logger.util');

const createBackupHandler = async (req, res, next) => {
    try {
        logger.info('Backup requested by user', { userId: req.user?._id });
        const message = await createBackup();
        logger.info('Backup completed successfully');
        sendSuccess(res, { message }, 'Backup created successfully', STATUS_CODES.CREATED);
    } catch (err) {
        logger.error('Backup creation failed', { error: err });
        next(err);
    }
};

const restoreBackupHandler = async (req, res, next) => {
    try {
        const { folderName } = req.body;
        if (!folderName) {
            logger.warn('Restore attempted without folderName');
            return next(new AppError('Backup folderName is required', STATUS_CODES.BAD_REQUEST));
        }
        logger.info(`Restore requested for backup folder: ${folderName}`);
        const message = await restoreBackup(folderName);
        logger.info('Restore completed successfully');
        sendSuccess(res, { message }, 'Backup restored successfully', STATUS_CODES.OK);
    } catch (err) {
        logger.error('Backup restore failed', { error: err });
        next(err);
    }
};

module.exports = {
    createBackupHandler,
    restoreBackupHandler
}
