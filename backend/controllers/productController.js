const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllProducts = async (req, res) => {
  try {
    const features = new APIFeatures(Product.find(), req.query);
    features.filter();
    features.sort();
    features.selectFields();
    features.limit();
    
    // Populate seller information
    features.query = features.query.populate({
      path: 'seller',
      select: 'username name email'
    });
    
    const products = await features.query;
    res.status(200).send({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Handle file uploads
    if (req.files) {
      // Handle cover image
      if (req.files.imageCover) {
        const imagePath = `/uploads/products/${req.files.imageCover[0].filename}`;
        req.body.imageCover = imagePath;
      }

      // Handle additional images
      if (req.files.images) {
        req.body.images = req.files.images.map(file => 
          `/uploads/products/${file.filename}`
        );
      }
    }

    // Set seller from authenticated user
    req.body.seller = req.user._id;
    
    // Handle auction vs regular product
    const isAuction = req.body.isAuction === 'true' || req.body.isAuction === true;
    const sellingType = isAuction ? 'auction' : 'regular';
    
    // Create product with proper type
    const product = await Product.create({
      ...req.body,
      isAuction,
      sellingType
    });

    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error fetching product',
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Handle file uploads
    if (req.files) {
      // Handle cover image
      if (req.files.imageCover) {
        req.body.imageCover = `/uploads/products/${req.files.imageCover[0].filename}`;
      }

      // Handle additional images
      if (req.files.images) {
        req.body.images = req.files.images.map(file => `/uploads/products/${file.filename}`);
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new Error('No product found with that ID');
    }

    res.status(200).send({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new Error('No product found with that ID');
    }
    res.status(204).send({
      status: 'success',
      message: 'Product deleted',
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};

// Add a function to get auction products
exports.getAuctionProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isAuction: true,
      sellingType: 'auction'
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Add a function to get regular products
exports.getRegularProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isAuction: false,
      sellingType: 'regular'
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
