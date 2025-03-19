const Wishlist = require('../models/wishlistModel');

// Get wishlist for a user
exports.getWishlist = async (req, res) => {
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
      wishlist = await Wishlist.create({
        username,
        items: []
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
    // const { username, product, name, sellingPrice } = req.body;

    // if (!username || !product || !name || !sellingPrice) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'Missing required fields'
    //   });
    // }

    const { username,productId} = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
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

    if (!productExists) {
      wishlist.items.push({
        product: product._id,
        name: product.name,
        sellingPrice: product.sellingPrice
      });
    }

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
      wishlist = await Wishlist.create({
        username,
        items: []
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
      wishlist = await Wishlist.create({
        username,
        items: []
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
