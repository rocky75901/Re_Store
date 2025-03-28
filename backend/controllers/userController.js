const { Storage } = require('@google-cloud/storage');
const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');

function filterObj(obj, ...allowedFields) {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
}
// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.CLOUD_STORAGE_PROJECT_ID,
  keyFilename: `${__dirname}/../cloud-storage.json`,
});

const bucketName = 're-store-web-images-bucket';
const bucket = storage.bucket(bucketName);

// Multer setup for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = async (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadProfilePhoto = upload.single('photo');

// Upload image to Google Cloud Storage
const uploadToGCS = async (file, userId) => {
  const fileName = `user-${userId}-${Date.now()}.jpeg`;
  const blob = bucket.file(fileName);

  const resizedImageBuffer = await sharp(file.buffer)
    .resize(200, 200)
    .jpeg({ quality: 90 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.end(resizedImageBuffer);
  });
};
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

    const filteredBody = filterObj(req.body, 'name', 'username', 'address');
    if (req.file) {
      const imageUrl = await uploadToGCS(req.file, req.user._id);
      filteredBody.photo = imageUrl;
    }

    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User data updated successfully',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error('Update error:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username already exists. Please choose a different username.',
      });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({
        status: 'fail',
        message: errors[0],
      });
    }
    res.status(500).json({
      status: 'fail',
      message: 'Error updating user data. Please try again.',
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
