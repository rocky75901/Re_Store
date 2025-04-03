const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');
const authController = require('../controllers/authController');

// Create new order
// Authentication: Requires user to be logged in
router.post('/', authController.protect, orderController.createOrder);
router.post(
  '/verify-payment',
  authController.protect,
  orderController.verifyPayment
);
// Get all orders
// Authentication temporarily disabled for testing
router.get(
  '/',
  /*authController.protect, authController.restrictTo('admin'),*/ orderController.getAllOrders
);

// Get single order
// Authentication: Requires user to be logged in
router.get('/:id', authController.protect, orderController.getOrder);

// Update order status
// Authentication: Requires user to be logged in
router.patch('/:id', authController.protect, orderController.updateOrderStatus);

// Get user orders - specific route should be before :id route
// Authentication: Requires user to be logged in
router.get(
  '/user/:username',
  authController.protect,
  orderController.getUserOrders
);

// Cancel order
// Authentication: Requires user to be logged in
router.patch(
  '/:id/cancel',
  authController.protect,
  orderController.cancelOrder
);

module.exports = router;
