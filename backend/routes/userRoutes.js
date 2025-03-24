const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('multer');

const userRouter = express.Router();

// signup
userRouter.post('/signup', authController.signup);
// email verification
userRouter.get('/emailVerification/:token', authController.verifyEmail);
// success page
userRouter.get('/email-verification-success', authController.renderSuccessPage);
// check for isVerified attribute
userRouter.get('/check-is-verified', authController.protect, authController.checkIsVerified);
// link expired page
userRouter.get('/link-expired', authController.renderLinkExpiredPage);
// get verification email
userRouter.get(
  '/get-verification-email',
  authController.protect,
  authController.getVerificationEmail
);
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
  .patch(
    authController.protect,
    userController.uploadProfilePhoto,
    userController.updateUser
  )
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
