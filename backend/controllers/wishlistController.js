const Wishlist = require('../models/wishlistModel');

// Get wishlist for a user
exports.getWishlist = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is required'
      });
    }

    const wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'No wishlist found for this user'
      });
    }

    res.status(200).json({
      status: 'success',
      data: wishlist
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { username, product, name, sellingPrice } = req.body;

    if (!username || !product || !name || !sellingPrice) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    let wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        username,
        items: []
      });
    }

    // Check if product already exists in wishlist
    const productExists = wishlist.items.some(item => 
      item.product.toString() === product
    );

    if (productExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product already exists in wishlist'
      });
    }

    wishlist.items.push({ product, name, sellingPrice });
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: wishlist
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { username, productId } = req.body;

    if (!username || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username and product ID are required'
      });
    }

    const wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'No wishlist found for this user'
      });
    }

    wishlist.items = wishlist.items.filter(item => 
      item.product.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: wishlist
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is required'
      });
    }

    const wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'No wishlist found for this user'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: wishlist
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
