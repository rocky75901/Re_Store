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
      expiresIn: '24h' // Set to 24 hours
    });
    console.log('Token generated successfully');

    // Remove password from output
    newUser.password = undefined;

    // Send response in the format expected by frontend
    res.status(201).json({
      status: 'success',
      token,
      user: newUser,
      message: 'Signup successful'
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error during signup. Please try again.'
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h' // Set to 24 hours
    });

    // Remove password from output
    user.password = undefined;

    // Send response in the format expected by frontend
    res.status(200).json({
      status: 'success',
      token,
      user,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error logging in. Please try again.'
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists.'
        });
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          status: 'fail',
          message: 'User recently changed password! Please log in again.'
        });
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = currentUser;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid token. Please log in again!'
        });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Your token has expired! Please log in again.'
        });
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed. Please log in again.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
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
