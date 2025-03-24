const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

// get all products
router.get('/', productController.getAllProducts);
// get product by id
router.get('/:id', productController.getProduct);
// create a product
router.route('/').post(authController.protect, productController.createProduct);
// update and delete products
router
  .route('/:id')
  .patch(productController.updateProduct)
  .delete(authController.restrictTo('admin'), productController.deleteProduct);

// Update all products to category 'others'
router.post('/update-all-to-others', authController.restrictTo('admin'), productController.updateAllProductsToOthers);

module.exports = router;
