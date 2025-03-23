const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

<<<<<<< HEAD
// signup
=======
// Auth routes - these must come BEFORE the :id routes
>>>>>>> f7c4e7edcf5c1ea3d28c9161c25ced9ca560cd47
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
<<<<<<< HEAD
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
=======

// User routes - these must come AFTER the specific routes
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

>>>>>>> f7c4e7edcf5c1ea3d28c9161c25ced9ca560cd47
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
