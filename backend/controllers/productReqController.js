const ProductReq = require('../models/productReqModel');

// get all requests
exports.getAllProductRequests = async (req, res) => {
  try {
    const productRequests = await ProductReq.find();
    res.status(200).send({
      status: 'success',
      results: productRequests.length,
      data: {
        productRequests,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
// get requests of a specific user
exports.getUserProductRequests = async (req, res) => {
  try {
    const userRequests = await ProductReq.find({ username: req.user.username });
    res.status(200).send({
      status: 'success',
      results: userRequests.length,
      data: {
        userRequests,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
// create a product request
exports.createProductRequest = async (req, res) => {
  try {
    if (!req.body.description) {
      return res.status(400).send({
        status: 'fail',
        send: 'Please Provide Product Description',
      });
    }
    const productRequest = await ProductReq.create({
      ...req.body,
      username: req.user.username,
    });
    res.status(201).send({
      status: 'success',
      data: {
        productRequest,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
// update product request
exports.updateProductRequest = async (req, res) => {
  try {
    if (req.body.username) {
      return res.status(400).send({
        status: 'fail',
        message: 'Username cannot be updated',
      });
    }
    let productRequest = await ProductReq.findById(req.params.id);
    if (productRequest.username !== req.user.username) {
      return res.status(401).send({
        status: 'fail',
        message: 'You cannot modify this request',
      });
    }
    productRequest = await ProductReq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      status: 'success',
      data: {
        productRequest,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
// delete product request
exports.deleteProductRequest = async (req, res) => {
  try {
    let productRequest = await ProductReq.findById(req.params.id);
    if (productRequest.username !== req.user.username) {
      return res.status(401).send({
        status: 'fail',
        message: 'Not authorised to delete',
      });
    }
    await ProductReq.findByIdAndDelete(req.params.id);
    res.status(204).send({
      status: 'success',
      message: 'Request Deleted',
    });
  } catch (err) {
    res.status(400).send({
      status: 'fail',
      message: err.message,
    });
  }
};
