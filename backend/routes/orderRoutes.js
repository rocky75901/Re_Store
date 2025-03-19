const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');

// Create new order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get single order
router.get('/:id', orderController.getOrder);

// Update order status
router.patch('/:id', orderController.updateOrder);

// Cancel order
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
