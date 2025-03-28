const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

// get all products
router.get('/', productController.getAllProducts);

// get seller's products - protected route
router.get('/seller/products', authController.protect, productController.getProductsBySeller);

// Allow sellers to delete their own products
router.delete('/seller/:id', authController.protect, productController.deleteSellerProduct);

// get product by id
router.get('/:id', productController.getProduct);
// create a product - protected route
router.post(
  '/',
  authController.protect,
  productController.uploadProductImages,
  productController.resizeProductImages,
  productController.createProduct
);
// update and delete products
router
  .route('/:id')
  .patch(
    authController.protect,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct
  )
  .delete(authController.protect, productController.deleteProduct);

module.exports = router;
