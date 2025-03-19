const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

exports.addProductToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ username: req.body.username });
    if (!cart) {
      cart = await Cart.create({
        username: req.body.username,
        items: []
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity if product exists
      existingItem.quantity += quantity;
    } else {
      // Add new item if product doesn't exist
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
      data: {
        cart
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail', 
      message: err.message
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    // Get cart from MongoDB using username
    let cart = await Cart.findOne({ username: req.body.username }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({
        username: req.body.username,
        items: []
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ username: req.body.username });
    if (!cart) {
      cart = await Cart.create({
        username: req.body.username,
        items: []
      });
      return res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    }

    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

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
      data: {
        cart
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ username: req.body.username });
    if (!cart) {
      cart = await Cart.create({
        username: req.body.username,
        items: []
      });
      return res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );
    
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ username: req.body.username });
    if (!cart) {
      cart = await Cart.create({
        username: req.body.username,
        items: []
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: {
        cart
      }
    });
    
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
