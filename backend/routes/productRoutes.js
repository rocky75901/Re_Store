const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const productRouter = express.Router();

//productRouter.param('id', productController.checkId);

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);
productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(authController.protect, productController.updateProduct)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = productRouter;
