const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.signup = async (req, res, next) => {
  try {
    console.log('Received signup request:', req.body);
    const newUser = await User.create({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      passwordChangedAt: req.body.passwordChangedAt,
    });
    console.log('User created successfully:', newUser);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log('Token generated successfully');

    const response = {
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    };
    console.log('Sending response:', response);

    // Set CORS headers explicitly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(201).json(response);
    console.log('Response sent successfully');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if email and password exists
    if (!email || !password) {
      throw new Error('Please Provide Email and Password');
    }
    //check if user exists and password is correct
    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
      throw new Error('Invalid Email Id or Password');
    }
    //send token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Remove password from output
    user.password = undefined;

    res.status(200).send({
      status: 'success',
      token,
      user,
      message: 'Login Successful',
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //Check if the token  exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new Error('Not authenticated');
    }
    //Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //Check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('Owner of this token no longer exists');
    }
    //Check if the user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new Error('Password Changed After Token Was Issued');
    }
    req.user = user;
    //Access to the protected route
    next();
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.restrictTo = (role) => {
  return (req, res, next) => {
    try {
      if (!role === req.user.role) {
        throw new Error('Not Authorized To delete product');
      }
      next();
    } catch (err) {
      res.status(400).send({
        status: 'fail',
        message: err.message,
      });
    }
  };
};
exports.forgotPassword = async (req, res) => {
  try {
    //1) Check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('User Not Found');
    }
    //2) Generate a random token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) Send it to users email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Click ${resetURL} to reset your password`;
    try {
      await sendEmail({
        email: req.body.email,
        subject: 'password reset link valid for 10 min',
        message: message,
      });
      res.status(200).send({
        status: 'Success',
        message: 'Reset link sent to your mail',
      });
    } catch (err) {
      user.passwordResetExpires = undefined;
      user.passwordResetToken = undefined;
      res.status(500).send({
        status: 'fail',
        message: 'Failed to send email Try Again!',
      });
    }
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    //1)Get user based on the token
    const hasedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hasedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2)Check user exists,token is not expired and set new password
    if (!user) {
      throw new Error('User does not exist or token is expired');
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //3)Update passwordChangedAt
    //4)Log the user in
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).send({
      status: 'success',
      token: token,
      message: 'Password Changed Successfully',
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    //1) Get user from the data base
    const user = await User.findById(req.user.id).select('+password');
    //2) Check POSTed password is correct
    if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
      throw new Error('Incorrect Current Password');
    }
    //3) Update Password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();
    //4) Log the user In
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).send({
      status: 'success',
      token: token,
      message: 'password updated',
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
