const express = require('express');
const router = express.Router();
const Size = require('../models/size.model');
const controller = require('../controllers/generic.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router
    .route('/')
    .post(authenticate, authorize('admin'), controller.createOne(Size))
    .get(controller.getAll(Size));

router
    .route('/:id')
    .get(controller.getOne(Size))
    .put(authenticate, authorize('admin'), controller.updateOne(Size))
    .delete(authenticate, authorize('admin'), controller.softDeleteOne(Size));

router
    .patch('/restore/:id', authenticate, authorize('admin'), controller.restoreOne(Size))

module.exports = router;
