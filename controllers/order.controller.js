// const Order = require('../models/order.model');
// const CartItem = require('../models/cart.model');
// const Customer = require('../models/customer.model');

// exports.checkout = async (req, res) => {
//   try {
//     const customerId = req.user._id;
//     const { shippingAddressId, paymentMethod } = req.body;

//     const customer = await Customer.findById(customerId);
//     if (!customer) return res.status(404).json({ message: 'Customer not found' });

//     const shippingAddress = customer.addresses.id(shippingAddressId);
//     if (!shippingAddress) return res.status(400).json({ message: 'Invalid address selected' });

//     const cartItems = await CartItem.find({ customer: customerId }).populate('product size');
//     if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

//     let totalPrice = 0;
//     const items = cartItems.map(item => {
//       totalPrice += item.priceAtAdding * item.quantity;
//       return {
//         product: item.product._id,
//         quantity: item.quantity,
//         size: item.size._id,
//         priceAtPurchase: item.priceAtAdding
//       };
//     });

//     const order = await Order.create({
//       customer: customerId,
//       items,
//       shippingAddress,
//       totalPrice,
//       paymentMethod: paymentMethod || 'cash'
//     });

//     await CartItem.deleteMany({ customer: customerId });

//     res.status(201).json({ message: 'Order placed successfully', order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Checkout failed', error: err.message });
//   }
// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
//     res.json({ count: orders.length, orders });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
//   }
// };

// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
//     res.json({ count: orders.length, orders });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch your orders', error: err.message });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.status = status;
//     await order.save();

//     res.json({ message: 'Order status updated', order });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to update status', error: err.message });
//   }
// };

// exports.cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const customerId = req.user._id;

//     const order = await Order.findOne({ _id: orderId, customer: customerId });
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     if (['shipped', 'delivered', 'returned'].includes(order.status)) {
//       return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
//     }

//     order.status = 'cancelled';
//     await order.save();

//     res.json({ message: 'Order cancelled successfully', order });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to cancel order', error: err.message });
//   }
// };

// exports.markAsReturned = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     if (order.status !== 'delivered') {
//       return res.status(400).json({ message: 'Only delivered orders can be marked as returned' });
//     }

//     order.status = 'returned';
//     await order.save();

//     res.json({ message: 'Order marked as returned', order });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to mark order as returned', error: err.message });
//   }
// };
