const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

// signup
userRouter.post('/signup', authController.signup);
// login
userRouter.post('/login', authController.login);
// forgot password
userRouter.post('/forgotPassword', authController.forgotPassword);
// reset password
userRouter.patch('/resetPassword/:token', authController.resetPassword);
// update password
userRouter.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
// basic user functions
userRouter
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  )
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);
// get user details
userRouter
  .route('/currentUser')
  .get(authController.protect, userController.getUser);
// delete user function for admin
userRouter
  .route('/adminDelete')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUserByAdmin
  );
// get a specific user for admin
userRouter
  .route('/getUserByAdmin/:id')
  .get(authController.protect, userController.getUserForAdmin);
// get userId
userRouter
  .route('/getUserId')
  .get(authController.protect, userController.getUserId);
module.exports = userRouter;
