const express = require('express');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const cartRouter = require('./routes/cartRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const orderRouter = require('./routes/orderRoutes');
const auctionRouter = require('./routes/auctionRoutes');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from public directory with proper CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  next();
}, express.static(path.join(__dirname, 'public', 'uploads')));

//middleware stack
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/auctions', auctionRouter);
app.use('/api/v1/chat', chatRouter);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = app;