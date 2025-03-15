const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is necessary'],
  },
  email: {
    type: String,
    required: [true, 'Email is necessary'],
    unique: true,
    validate: {
      validator: function(v) {
        return v.endsWith('@iitk.ac.in');
      },
      message: 'Please use your IITK email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is necessary'],
    minlength: 4
  },
  address: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
