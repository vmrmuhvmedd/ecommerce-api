const mongoose = require('mongoose');
const User = require('./user.model');
const addressSchema = require('./address.model');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Gender is required']
  },
  addresses: {
    type: [addressSchema],
    default: []
  }
});

const Customer = User.discriminator('Customer', customerSchema);

module.exports = Customer;
