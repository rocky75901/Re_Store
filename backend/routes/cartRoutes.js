const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const cartRouter = express.Router();

cartRouter
  .route('/')
  .get(authController.protect, cartController.getCart)
  .post(authController.protect, cartController.addToCart);

cartRouter
  .route('/update')
  .patch(authController.protect, cartController.updateCartItem);

cartRouter
  .route('/remove')
  .delete(authController.protect, cartController.removeFromCart);

cartRouter
  .route('/clear')
  .delete(authController.protect, cartController.clearCart);

// cartRouter
//   .route('/checkout') 
//   .post(cartController.checkout);

module.exports = cartRouter;
