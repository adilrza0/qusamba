const Order = require('../models/Order');
const { sendOrderConfirmationEmail, sendOrderShippedEmail } = require('../utils/email');

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount
    });
    
    // Populate the order with user and product details for email
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price');
    
    // Send order confirmation email
    await sendOrderConfirmationEmail(order.user.email, order.user.name, order);
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    // Send email notification when order is shipped
    if (status === 'shipped') {
      await sendOrderShippedEmail(order.user.email, order.user.name, order);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
