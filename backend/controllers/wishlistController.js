const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// Check if item is in wishlist
exports.checkWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    // Get username from authenticated user
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please log in to check wishlist status'
      });
    }

    const wishlist = await Wishlist.findOne({ username });

    // If no wishlist exists, item is not in wishlist
    if (!wishlist) {
      return res.status(200).json({
        status: 'success',
        data: {
          isInWishlist: false
        }
      });
    }

    // Check if product exists in wishlist
    const isInWishlist = wishlist.items.some(item => 
      item.product.toString() === productId.toString()
    );

    res.status(200).json({
      status: 'success',
      data: {
        isInWishlist
      }
    });

  } catch (error) {
    console.error('Error in checkWishlistItem:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get wishlist for a user
// exports.getWishlist = async (req, res) => {
//   try {
//     const { username } = req.query; // Changed from req.body to req.query since it's a GET request
    
//     if (!username) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Username is required'
//       });
//     }

//     let wishlist = await Wishlist.findOne({ username });

//     if (!wishlist) {
//       wishlist = await Wishlist.create({
//         username,
//         items: []
//       });
//     }
    

//     res.status(200).json({
//       status: 'success',
//       data: wishlist
//     });

//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// };

exports.getWishlist = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is required'
      });
    }

    let wishlist = await Wishlist.findOne({ username }).populate({
      path: 'items.product',
      model: 'Product',
      select: 'isAvailable'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        username,
        items: []
      });
    } else {
      // Filter out items where the product is not available
      wishlist.items = wishlist.items.filter(item => 
        item.product && item.product.isAvailable === true
      );
      
      wishlist.items = wishlist.items.map(item => ({
        product: item.product._id, // Keep only the ID
        name: item.name,
        sellingPrice: item.sellingPrice,
        image: item.image
      }));
      
      // Save the filtered wishlist
      await wishlist.save();
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
    const { username, productId } = req.body;

    if (!username || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username and product ID are required'
      });
    }

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
      item.product.toString() === productId.toString()
    );

    if (!productExists) {
      wishlist.items.push({
        product: productId,
        name: product.name,
        sellingPrice: product.sellingPrice,
        image: product.imageCover // Added image for display
      });
    }

    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: wishlist
    });

  } catch (error) {
    console.error('Error in addToWishlist:', error);
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
