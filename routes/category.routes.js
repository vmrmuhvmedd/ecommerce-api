const express = require('express');
const router = express.Router();
const Category = require('../models/category.model');
const controller = require('../controllers/generic.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router
    .route('/')
    .post(authenticate, authorize('admin'), controller.createOne(Category))
    .get(authenticate.optional, controller.getAll(Category));

router
    .route('/:id')
    .get(controller.getOne(Category))
    .put(authenticate, authorize('admin'), controller.updateOne(Category))
    .delete(authenticate, authorize('admin'), controller.softDeleteOne(Category));

router
    .patch('/restore/:id', authenticate, authorize('admin'), controller.restoreOne(Category));

module.exports = router;
