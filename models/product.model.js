const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantSchema = new Schema({
  color: {
    type: Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  },
  size: {
    type: Schema.Types.ObjectId,
    ref: 'Size',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  image: String
}, { _id: false });

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true 
  },
  description: {
    type: String,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  images: [String],
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  variants: {
    type: [variantSchema],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one variant is required'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);