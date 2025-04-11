const express = require('express');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const orderRouter = require('./routes/orderRoutes');
const auctionRouter = require('./routes/auctionRoutes');
const productReqRouter = require('./routes/productReqRoutes');
const adminRoutes = require('./routes/adminRoutes');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { cleanupOrphanedAuctions } = require('./controllers/auctionController');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//middleware stack
app.use(
  cors({
    origin: process.env.FRONTEND_BASEURL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  })
);
app.use(express.static('./public'));
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
app.use('/api/v1/admin', adminRoutes);
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Run cleanup on server start
cleanupOrphanedAuctions()
  .then(() => {
    console.log('Initial auction cleanup completed');
  })
  .catch((err) => {
    console.error('Error during initial auction cleanup:', err);
  });

module.exports = app;
