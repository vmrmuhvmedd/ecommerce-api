const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: Schema.Types.ObjectId,
        ref: 'Size',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    priceAtAdding: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

cartItemSchema.index({ customer: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);
