const express = require('express');
const productController = require('../controllers/productController');

const productRouter = express.Router();

//productRouter.param('id', productController.checkId);

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);
productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = productRouter;
