const express = require('express');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const orderRouter = require('./routes/orderRoutes');
const auctionRouter = require('./routes/auctionRoutes');
const productReqRouter = require('./routes/productReqRoutes');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static('./public'));
//middleware stack
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/auctions', auctionRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/product-requests', productReqRouter);
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = app;
