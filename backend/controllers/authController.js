const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');
const crypto = require('crypto');
const pug = require('pug');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      passwordChangedAt: req.body.passwordChangedAt,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    // send a welcome email
    await new Email(newUser, '#').sendWelcome();
    // Remove password from output
    newUser.password = undefined;
    // Send response in the format expected by frontend
    res.status(201).json({
      status: 'success',
      token,
      user: newUser,
      message: 'Signup successful',
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error during signup. Please try again.',
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        status: 'fail',
        message: 'Enter login credentials',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(400).send({
        status: 'fail',
        message: 'Invalid EmailId or Password',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Remove password from output
    user.password = undefined;

    user.photo = `${__dirname}/../public/img/users/${user.photo}`;
    // Send response in the format expected by frontend
    res.status(200).json({
      status: 'success',
      token,
      user,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error logging in. Please try again.',
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1) Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.',
      });
    }

    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4) Check if the user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password. Please log in again.',
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message:
        err.name === 'JsonWebTokenError'
          ? 'Invalid token. Please log in again.'
          : err.message,
    });
  }
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    try {
      if (!role === req.user.role) {
        res.status(403).send({
          status: 'fail',
          message: 'Not Authorized',
        });
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
      return res.status(404).send({
        status: 'fail',
        message: 'User Not Found',
      });
    }
    if (!user.isVerified) {
      return res.status(401).send({
        status: 'fail',
        message: 'Email Not Verified',
      });
    }
    //2) Generate a random token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) Send it to users email
    const resetURL = `${process.env.FRONTEND_BASEURL}reset-password/${resetToken}`;
    try {
      await new Email(user, resetURL).sendPasswordReset();
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
      res.status(404).send({
        status: 'fail',
        message: 'User Not Found or Token Expired',
      });
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
      res.status(401).send({
        status: 'fail',
        message: 'Incorrect Password',
      });
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
exports.verifyEmail = async (req, res) => {
  try {
    // generate the hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    // get user base on token and also check wether token is still valid
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect(
        `${req.protocol}://${req.get('host')}/api/v1/users/link-expired`
      );
    }
    // change isVerfied for the user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.redirect(
      `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/email-verification-success`
    );
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.getVerificationEmail = async (req, res) => {
  try {
    const user = req.user;
    // email verification token
    const verToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    // verification url
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/emailVerification/${verToken}`;

    await new Email(user, url).sendVerification();
    res.status(200).send({
      status: 'success',
      message: 'Verification Mail Sent',
    });
  } catch (err) {
    res.send(400).status({
      status: 'Fail',
      message: err.message,
    });
  }
};
exports.renderSuccessPage = async (req, res) => {
  try {
    const success = pug.renderFile(
      `${__dirname}/../views/verifications/verificationSuccess.pug`
    );
    res.send(success);
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.renderLinkExpiredPage = async (req, res) => {
  try {
    const error = pug.renderFile(
      `${__dirname}/../views/verifications/linkExpired.pug`
    );
    res.send(error);
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err.message,
    });
  }
};
