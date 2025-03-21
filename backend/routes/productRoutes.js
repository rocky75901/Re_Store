const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const upload = require('../utils/fileUpload');

const productRouter = express.Router();

//productRouter.param('id', productController.checkId);

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 5 }
    ]),
    productController.createProduct
  );
productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 5 }
    ]),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = productRouter;
