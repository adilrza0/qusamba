const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
  const { items, totalAmount } = req.body;
  const order = await Order.create({
    user: req.user.id,
    items,
    totalAmount
  });
  res.status(201).json(order);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product');
  res.json(orders);
};
