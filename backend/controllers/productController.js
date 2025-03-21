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

    // Add seller ID from authenticated user
    req.body.sellerId = req.user._id;

    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error creating product',
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
