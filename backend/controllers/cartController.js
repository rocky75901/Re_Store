const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Get cart for a user
exports.getCart = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is required'
      });
    }

    let cart = await Cart.findOne({ username }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ username, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { username, productId, quantity = 1 } = req.body;

    if (!username || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username and product ID are required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    let cart = await Cart.findOne({ username });
    if (!cart) {
      cart = await Cart.create({ username, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        sellingPrice: product.sellingPrice,
        quantity
      });
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { username, productId, quantity } = req.body;

    if (!username || !productId || quantity < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid username, product ID, or quantity'
      });
    }

    const cart = await Cart.findOne({ username });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }

    const cartItem = cart.items.find(item => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found in cart'
      });
    }

    cartItem.quantity = quantity;
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { username, productId } = req.body;

    if (!username || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username and product ID are required'
      });
    }

    const cart = await Cart.findOne({ username });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is required'
      });
    }

    const cart = await Cart.findOne({ username });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
