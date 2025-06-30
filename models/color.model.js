const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  hex: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Color', colorSchema);