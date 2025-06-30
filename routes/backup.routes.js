const express = require('express');
const router = express.Router();
const authorize = require('../middleware/role.middleware');
const authenticate = require('../middleware/auth.middleware');
const { createBackupHandler, restoreBackupHandler } = require('../controllers/backup.controller');

router.use(authenticate);

router.get('/backup', authorize('admin'), createBackupHandler);
router.post('/restore', authorize('admin'), restoreBackupHandler);

module.exports = router;
