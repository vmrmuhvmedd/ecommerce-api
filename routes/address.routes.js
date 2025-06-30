const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const addressController = require('../controllers/address.controller');

router.use(authenticate);

router.post('/', addressController.addAddress);
router.put('/:addressId', addressController.updateAddress);
router.delete('/:addressId', addressController.softDeleteAddress);
router.patch('/:addressId/set-default', addressController.setDefaultAddress);

module.exports = router;