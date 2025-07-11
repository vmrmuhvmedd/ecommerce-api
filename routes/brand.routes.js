const express = require('express');
const router = express.Router();
const Brand = require('../models/brand.model');
const controller = require('../controllers/generic.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router
    .route('/')
    .post(authenticate, authorize('admin'), controller.createOne(Brand))
    .get(authenticate.optional, controller.getAll(Brand));

router
    .route('/:id')
    .get(controller.getOne(Brand))
    .put(authenticate, authorize('admin'), controller.updateOne(Brand))
    .delete(authenticate, authorize('admin'), controller.softDeleteOne(Brand));

router
    .patch('/restore/:id', authenticate, authorize('admin'), controller.restoreOne(Brand))

module.exports = router;
