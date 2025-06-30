const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  label: {
    type: String,
    required: [true, 'Address label is required'],
    enum: ['Home', 'Work', 'Other']
  },
  street: {
    type: String,
    required: [true, 'Street is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  country: {
    type: String,
    enum: ['Egypt'],
    default: 'Egypt'
  },
  building: String,
  apartment: String,
  postalCode: String,
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^01[0125]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Egyptian phone number!`
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isDeleted: {
  type: Boolean,
  default: false
}
}, { _id: false });

module.exports = addressSchema;