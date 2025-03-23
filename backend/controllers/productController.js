const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllProducts = async (req, res) => {
  try {
    const features = new APIFeatures(Product.find(), req.query);
    features.filter();
    features.sort();
    features.selectFields();
    features.limit();
    
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
    console.log('Received product data:', req.body);
    console.log('Received files:', req.files);

    // Basic validation
    const requiredFields = ['name', 'description', 'condition', 'usedFor'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate selling type and prices
    const isAuction = req.body.isAuction === 'true' || req.body.isAuction === true;
    const sellingType = isAuction ? 'auction' : 'regular';

    if (sellingType === 'regular' && (!req.body.buyingPrice || !req.body.sellingPrice)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Regular products must have both buying and selling prices'
      });
    }

    if (sellingType === 'auction' && !req.body.sellingPrice) {
      return res.status(400).json({
        status: 'fail',
        message: 'Auction products must have a starting price'
      });
    }

    // Handle file uploads
    if (!req.files || !req.files.imageCover) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one image'
      });
    }

    // Process the data
    const productData = {
      ...req.body,
      seller: req.user._id,
      isAuction,
      sellingType,
      imageCover: `/uploads/products/${req.files.imageCover[0].filename}`
    };

    // Handle additional images
    if (req.files.images) {
      productData.images = req.files.images.map(file => 
        `/uploads/products/${file.filename}`
      );
    }

    // Convert numeric fields
    if (productData.buyingPrice) productData.buyingPrice = Number(productData.buyingPrice);
    if (productData.sellingPrice) productData.sellingPrice = Number(productData.sellingPrice);
    if (productData.usedFor) productData.usedFor = Number(productData.usedFor);

    console.log('Creating product with data:', productData);

    // Create the product
    const product = await Product.create(productData);

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
      message: error.message || 'Error creating product'
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
