const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const authController = require('../controllers/authController');

const wishlistRouter = express.Router();

// Add check endpoint before other routes
wishlistRouter
  .route('/check/:productId')
  .get(authController.protect, wishlistController.checkWishlistItem);

wishlistRouter
  .route('/')
  .get(authController.protect,wishlistController.getWishlist)
  .post(authController.protect,wishlistController.addToWishlist);

wishlistRouter
  .route('/remove')
  .delete(authController.protect,wishlistController.removeFromWishlist);

wishlistRouter
  .route('/clear') 
  .delete(authController.protect,wishlistController.clearWishlist);

module.exports = wishlistRouter;
