const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
console.log( authRoutes)
app.use(cors());
app.use(express.json());
app.get('/api', (req, res) => 
  res.send('Welcome to the E-commerce API'))

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      
      console.log(`Server running at ${process.env.PORT || 5000} and DB connected`);
    });
  })
  .catch(err => console.log(err));
