const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is necessary'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Name is necessary'],
  },
  password: {
    type: String,
    required: [true, 'password is necessary'],
  },
  email: {
    type: String,
    required: [true, 'email is necessary'],
    unique: true,
  },
  address: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
