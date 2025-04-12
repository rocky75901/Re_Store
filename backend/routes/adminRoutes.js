const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Get admin statistics
router.get(
  '/stats',
  authController.protect,
  authController.restrictTo('admin'),
  adminController.getAdminStats
);

module.exports = router;