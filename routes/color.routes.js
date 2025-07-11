const express = require('express');
const router = express.Router();
const Color = require('../models/color.model');
const controller = require('../controllers/generic.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router
    .route('/')
    .post(authenticate, authorize('admin'), controller.createOne(Color))
    .get(authenticate.optional, controller.getAll(Color));

router
    .route('/:id')
    .get(controller.getOne(Color))
    .put(authenticate, authorize('admin'), controller.updateOne(Color))
    .delete(authenticate, authorize('admin'), controller.softDeleteOne(Color));

router
    .patch('/restore/:id', authenticate, authorize('admin'), controller.restoreOne(Color));

module.exports = router;
