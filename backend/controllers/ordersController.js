const Order = require('../models/orderModel');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { username, items, totalAmount, shippingAddress } = req.body;

    if (!username || !items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields'
      });
    }

    const order = await Order.create({
      username,
      items,
      totalAmount,
      shippingAddress
    });

    res.status(201).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      status: 'error', 
      message: error.message
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get orders by username
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ username: req.params.username });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot cancel delivered order'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
