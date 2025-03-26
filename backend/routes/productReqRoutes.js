const express = require('express');
const productReqController = require('../controllers/productReqController');
const authController = require('../controllers/authController');

const router = express.Router();

// get all product requests
router
  .route('/')
  .get(productReqController.getAllProductRequests)
  .post(authController.protect, productReqController.createProductRequest);
router
  .route('/user-requests')
  .get(authController.protect, productReqController.getUserProductRequests);
router
  .route('/:id')
  .patch(authController.protect, productReqController.updateProductRequest)
  .delete(authController.protect, productReqController.deleteProductRequest);

module.exports = router;
