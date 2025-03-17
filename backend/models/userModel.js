const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  address: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

//run this function before saving to DB if password is modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
//for updating the passwordChangedAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next;

  this.passwordChangedAt = Date.now() - 10 * 1000;
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
//Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
