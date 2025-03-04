const express = require('express');
const cartController = require('../controllers/cartController');

const cartRouter = express.Router();

cartRouter
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addProductToCart);

cartRouter
  .route('/update')
  .patch(cartController.updateCartItem);

cartRouter
  .route('/remove')
  .delete(cartController.removeFromCart);

cartRouter
  .route('/clear')
  .delete(cartController.clearCart);

// cartRouter
//   .route('/checkout') 
//   .post(cartController.checkout);

module.exports = cartRouter;
