const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');
const sharp = require('sharp');
const { Storage } = require('@google-cloud/storage');

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

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.CLOUD_STORAGE_PROJECT_ID,
  keyFilename: `${__dirname}/../cloud-storage.json`,
});

const bucketName = 're-store-web-images-bucket';
const bucket = storage.bucket(bucketName);

// Multer setup for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = async (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]);
// Resize and Upload Images to GCS
const uploadToGCS = async (buffer, filename) => {
  const blob = bucket.file(filename);
  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: 'image/jpeg',
    });

    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      resolve(publicUrl);
    });

    blobStream.end(buffer);
  });
};

exports.resizeProductImages = async (req, res, next) => {
  try {
    // 1) Handle Cover Image
    if (req.files.imageCover) {
      const filename = `product-${Date.now()}-cover.jpeg`;
      const buffer = await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      req.body.imageCover = await uploadToGCS(buffer, filename);
    }

    // 2) Handle Additional Images
    if (req.files.images) {
      req.body.images = await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `product-${Date.now()}-${i + 1}.jpeg`;
          const buffer = await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toBuffer();

          return await uploadToGCS(buffer, filename);
        })
      );
    }

    next();
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(400).json({
      status: 'fail',
      message: 'Error processing images',
    });
  }
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

// Add a function to get products by seller ID
exports.getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).populate(
      'seller',
      'username name email'
    );

    // Format image URLs
    products.forEach((product) => {
      if (product.imageCover) {
        product.imageCover = `${req.protocol}://${req.get(
          'host'
        )}/img/products/${product.imageCover}`;
      }
      if (product.images) {
        product.images = product.images.map(
          (image) =>
            `${req.protocol}://${req.get('host')}/img/products/${image}`
        );
      }
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error fetching seller products',
    });
  }
};

// Add a function to allow sellers to delete their own products
exports.deleteSellerProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID',
      });
    }

    // Check if the current user is the seller of the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own products',
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting seller product:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error deleting product',
    });
  }
};
