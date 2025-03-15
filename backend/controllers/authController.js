const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).send({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).send({
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
    res.status(200).send({
      status: 'success',
      token,
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
      throw new Error('Not authorized');
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
