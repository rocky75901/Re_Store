const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
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
