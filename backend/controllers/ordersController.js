const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { username, items, totalAmount, shippingAddress } = req.body;

    if (!username || !items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields',
      });
    }
    if (username !== req.user.username) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not authorized to create this order',
      });
    }
    // line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // create a checkout session and send it to front-end
    const session = await stripe.checkout.sessions.create({
      // session info
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_BASEURL}cart`,
      cancel_url: `${process.env.FRONTEND_BASEURL}cart`,
      customer_email: req.user.email,
      client_reference_id: username,
      // product info
      line_items: lineItems,
    });
    // adding order to DB
    // const order = await Order.create({
    //   username,
    //   items,
    //   totalAmount,
    //   shippingAddress,
    // });
    //  Logic to remove purchased items <To be included after payments success>

    // const userCart = await Cart.findOne({ username: username });
    // let currItems = userCart.items;
    // items.forEach((element) => {
    //   currItems = currItems.filter((item) => item.product != element.product);
    // });
    // await Cart.findOneAndUpdate({ username: username }, { items: currItems });
    // await userCart.save();
    res.status(201).json({
      status: 'success',
      session,
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
