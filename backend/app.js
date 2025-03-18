const express = require('express');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

//middleware stack
app.use(cors());  // Enable CORS for all routes
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});
app.use('/api/v1/chats', chatRouter);

module.exports = app;
