const express = require('express');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const orderRouter = require('./routes/orderRoutes');
const auctionRouter = require('./routes/auctionRoutes');
const morgan = require('morgan');

const app = express();

//middleware stack
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);

//routes by saatvik
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/auctions', auctionRouter);

module.exports = app;
