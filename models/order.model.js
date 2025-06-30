// const mongoose = require('mongoose');
// const addressSchema = require('./address.model');
// const Schema = mongoose.Schema;

// const orderSchema = new Schema({
//   customer: {
//     type: Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true
//   },
//   items: [{
//     product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
//     quantity: { type: Number, required: true, min: 1 },
//     size: { type: Schema.Types.ObjectId, ref: 'Size', required: true },
//     priceAtPurchase: { type: Number, required: true }
//   }],
//   shippingAddress: addressSchema,
//   status: {
//     type: String,
//     enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
//     default: 'pending'
//   },
//   totalPrice: {
//     type: Number,
//     required: true
//   },
//   isPaid: {
//     type: Boolean,
//     default: false
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['cash', 'credit_card', 'paypal'],
//     default: 'cash'
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Order', orderSchema);