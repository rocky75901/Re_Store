const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const username = req.user.username;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields',
      });
    }

    // create a razorpay order
    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${username}_${Date.now()}`,
      payment_capture: 1,
    };

    let order = await razorpay.orders.create(options);
    order.customer_details = req.user.email;
    order.success_url = `${process.env.FRONTEND_BASEURL}cart`;
    order.cancel_url = `${process.env.FRONTEND_BASEURL}cart`;

    // Create order in database
    const dbOrder = await Order.create({
      username,
      items,
      totalAmount,
      shippingAddress,
    });

    // Clear cart after successful order creation
    const userCart = await Cart.findOne({ username });
    if (userCart) {
      userCart.items = [];
      await userCart.save();
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: dbOrder,
        razorpayOrder: order
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
        message: 'No order found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
        message: 'Please provide status',
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
        message: 'No order found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
        message: 'Please provide payment status',
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
        message: 'No order found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
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
        message: 'No order found with that ID',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: 'Order is already cancelled',
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot cancel delivered order',
      });
    }
    if (order.username !== req.user.username) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not authorized to cancel this order',
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
