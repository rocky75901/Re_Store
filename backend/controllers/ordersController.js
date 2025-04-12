const crypto = require('crypto');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Email = require('../utils/email');
const User = require('../models/userModel');

exports.getPaymentForm = async (req, res, next) => {
  try {
    const { totalAmount } = req.body;
    // create a razorpay order'
    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `r_${req.user._id}_${Date.now()}`.slice(0, 35),
      payment_capture: 1,
    };
    let order = await razorpay.orders.create(options);
    order.customer_details = req.user.email;
    order.success_url = `${process.env.FRONTEND_BASEURL}/orders`;
    order.cancel_url = `${process.env.FRONTEND_BASEURL}/cart`;

    console.log(order);
    res.status(200).send({
      status: 'success',
      order: order,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message ? err.message : err.error.description,
    });
  }
};
// Create new order
exports.createOrder = async (req, res) => {
  try {
    // validate order
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentStatus,
      razorpay_order_id,
    } = req.body;
    const username = req.user.username;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields',
      });
    }
    let products = [];
    for (const el of items) {
      const fullProduct = await Product.findById(el.product);
      await Product.findByIdAndUpdate(el.product, { isAvailable: false });
      await fullProduct.save({ runValidators: false });
      products.push(fullProduct);
    }
    for (const el of products) {
      const seller = await User.findById(el.seller);
      await new Email(
        seller,
        `${process.env.FRONTEND_BASEURL}/sellhistory`
      ).sendProductSoldMail({
        productName: el.name,
        imageUrl: el.imageCover,
        category: el.category,
        price: el.sellingPrice,
      });
    }
    // Create order in database
    const dbOrder = await Order.create({
      username,
      items,
      totalAmount,
      shippingAddress,
      paymentStatus,
      razorpay_order_id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: {
        dbOrder: dbOrder,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const username = req.user.username;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).send({
        status: 'fail',
        message: 'No Payment Details',
      });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).send({
        status: 'fail',
        message: 'Payment Verification Failed',
      });
    }
    res.status(200).send({
      status: 'success',
      message: 'Payment Successful',
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
    const orders = await Order.find({ username: req.params.username }).sort({
      orderDate: -1,
    });

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
