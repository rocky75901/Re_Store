const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');
const sharp = require('sharp');

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
      select: 'username name email',
    });

    const products = await features.query;
    products.map(
      (el) =>
        (el.imageCover = `${req.protocol}://${req.get('host')}/img/products/${
          el.imageCover
        }`)
    );
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

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      res.status(400).send({ status: 'fail', message: 'Not An Image' }),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]);
exports.resizeProductImages = async (req, res, next) => {
  // 1) cover image
  if (req.files.imageCover) {
    req.body.imageCover = `product-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${req.body.imageCover}`);
  }
  // 2) Images
  if (req.files.images) {
    const images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${filename}`);
        images.push(filename);
      })
    );
    req.body.images = images;
  }
  next();
};
exports.createProduct = async (req, res) => {
  try {
    // Set seller from authenticated user
    req.body.seller = req.user._id;

    // Handle auction vs regular product
    const isAuction =
      req.body.isAuction === 'true' || req.body.isAuction === true;
    const sellingType = isAuction ? 'auction' : 'regular';

    // Create product with proper type
    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
      isAuction,
      sellingType,
    });

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'username name email'
    );
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error fetching product',
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product_before = await Product.findById(req.params.id);

    if (!product_before) {
      return res.status(404).send({
        status: 'fail',
        message: 'No Product Found With That ID',
      });
    }
    if (product_before.seller != req.user._id) {
      return res.status(401).send({
        status: 'fail',
        message: 'Not Authorized To Update This Product',
      });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).send({
      status: 'success',
      data: {
        product: product,
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        status: 'fail',
        message: 'No Product With That ID Found',
      });
    }
    if (product.seller != req.user._id && req.user.role != 'admin') {
      return res.status(401).send({
        status: 'fail',
        message: 'Not Authorized To Delete This Product',
      });
    }
    await Product.findByIdAndDelete(req.params.id);
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
      sellingType: 'auction',
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a function to get regular products
exports.getRegularProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isAuction: false,
      sellingType: 'regular',
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Add a function to update all products to category 'others'
exports.updateAllProductsToOthers = async (req, res) => {
  try {
    const result = await Product.updateMany(
      {},
      { $set: { category: 'others' } }
    );

    res.status(200).json({
      status: 'success',
      message: `Updated ${result.modifiedCount} products to category 'others'`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
