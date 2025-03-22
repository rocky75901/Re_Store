const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Public routes
router.get('/auctions', productController.getAuctionProducts);
router.get('/regular', productController.getRegularProducts);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes
router.use(authController.protect);

//productRouter.param('id', productController.checkId);

router
  .route('/')
  .post(
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 5 }
    ]),
    productController.createProduct
  );

router
  .route('/:id')
  .patch(
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 5 }
    ]),
    productController.updateProduct
  )
  .delete(
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = router;
