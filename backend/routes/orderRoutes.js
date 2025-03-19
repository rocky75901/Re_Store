const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');

// Create new order
router.post('/',authController.protect, orderController.createOrder);

// Get all orders
router.get('/',authController.protect, authController.restrictTo('admin'), orderController.getAllOrders);

// Get single order
router.get('/:id',authController.protect, orderController.getOrder);

// Update order status
router.patch('/:id', orderController.updateOrder);

router.get('/user/:username',authController.protect, orderController.getUserOrders);
// Cancel order
router.patch('/:id/cancel',authController.protect, orderController.cancelOrder);

module.exports = router;
