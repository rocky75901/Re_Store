const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is necessary'],
  },
  email: {
    type: String,
    required: [true, 'Email is necessary'],
    unique: true,
    lowercase: true,
    validate: {
      //This only works on CREATE and SAVE
      validator: function (el) {
        return el.endsWith('@iitk.ac.in');
      },
      message: 'Please use your valid IITK email address',
    },
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is necessary'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password Confirmation is necessary'],
    validate: {
      validator: function (el) {
        // This only works CREATE on SAVE
        return el === this.password;
      },
      message: 'Passwords did not match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  address: {
    type: String,
  },
});

//run this function before saving to DB if password is modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
//Instance method to check password
userSchema.methods.checkPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//Check If password changed after token is issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
