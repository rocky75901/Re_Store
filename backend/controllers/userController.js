const User = require('../models/userModel');
const multer = require('multer');

function filterObj(obj, ...allowedFields) {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // file name user-user-id-date
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      res.status(400).send({ status: 'fail', message: 'Not An Image' }),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProfilePhoto = upload.single('photo');
// get all users handler
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
// get user details for logged in users to display their profile
exports.getUser = async (req, res) => {
  const user = req.user;
  user.photo = `${req.protocol}://${req.get('host')}/img/users/${user.photo}`;
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// get a specific user for admin
exports.getUserForAdmin = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      name: user.name,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      message: 'error while fetching data',
    });
  }
};
// update user details
exports.updateUser = async (req, res) => {
  try {
    if (req.body.password || req.body.confirmPassword) {
      return res.status(400).send({
        status: 'fail',
        message: 'Cannot Update Password Here',
      });
    }

    const filteredBody = filterObj(req.body, 'name');
    if (req.file) filteredBody.photo = req.file.filename;
    let user = User.findById(req.user._id);
    user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: [req.body.email] ? true : false,
    });
    res.status(200).json({
      status: 'success',
      message: 'User data updated',
      data: user,
    });
  } catch (err) {
    console.log(err);
    if (err.name === 'ValidationError') {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      const { email } = errors;
      if (email) {
        res.status(404).json({
          status: 'fail',
          message: 'Not a valid email format',
        });
      }
    }
    res.status(404).json({
      status: 'fail',
      message: 'update failed try again',
    });
  }
};
// delete user for admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id).select('+password');
    const correct = user.checkPassword(req.body.currentPassword, user.password);
    if (!correct) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid password',
      });
    }
    await User.findByIdAndDelete(user._id);
    res.status(400).json({
      status: 'success',
      message: 'user deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Error in deleting',
    });
  }
};
// delete user for admin
exports.deleteUserByAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.body.id);
    res.status(400).json({
      status: 'success',
      message: 'user deleted successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      message: 'Error in deleting !!',
    });
  }
};
// get user id
exports.getUserId = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      userId: req.user._id,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'failed to fetch user id',
    });
  }
};
