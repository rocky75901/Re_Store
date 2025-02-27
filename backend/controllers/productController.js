const fs = require('fs');

const products = JSON.parse(
  fs.readFileSync(`./dev-data/data/products-simple.json`, 'utf-8')
);

exports.getAllProducts = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
};
exports.createProduct = (req, res) => {
  const productId = products[products.length - 1].id + 1;
  const product = Object.assign({ id: productId }, req.body);
  products.push(product);
  fs.writeFile(
    `./dev-data/data/products-simple.json`,
    JSON.stringify(products),
    (err) => {
      if (err) return console.log(err.message);
      res.status(201).send({
        status: 'success',
        data: {
          products: product,
        },
      });
    }
  );
};
exports.getProduct = (req, res) => {
  const productId = req.params.id * 1;
  const product = products.find((el) => el.id === productId);
  res.status(200).send({
    status: 'success',
    data: {
      products: product,
    },
  });
};
exports.updateProduct = (req, res) => {
  const productId = req.params.id * 1;
  const product = products.find((el) => el.id === productId);
  res.status(200).send({
    status: 'success',
    data: {
      products: '<Updated Product>',
    },
  });
};
exports.deleteProduct = (req, res) => {
  const productId = req.params.id * 1;
  const product = products.find((el) => el.id === productId);
  res
    .status(204)
    .send({ status: 'success', message: 'This product is deleted' });
};
exports.checkId = (req, res, next, val) => {
  if (val > products[products.length - 1].id) {
    return res.status(404).send({ status: 'error', message: 'InvalidID' });
  }
  next();
};
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).send({ status: 'fail', message: 'Bad request' });
  }
  next();
};
