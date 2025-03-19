const express = require('express');
const wishlistController = require('../controllers/wishlistController');

const wishlistRouter = express.Router();

wishlistRouter
  .route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist);

wishlistRouter
  .route('/remove')
  .delete(wishlistController.removeFromWishlist);

wishlistRouter
  .route('/clear') 
  .delete(wishlistController.clearWishlist);

module.exports = wishlistRouter;
