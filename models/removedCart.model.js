const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const removedCartItemSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
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
        min: 1
    },
    priceAtRemoving: {
        type: Number,
        required: true
    },
    removedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RemovedCartItem', removedCartItemSchema);