const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const fetch = require('node-fetch');

const shippingRoutes = require('./routes/shippingRoutes');

dotenv.config();
const SELF_URL = "https://qusamba.onrender.com";
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
// const paymentRoutes = require('./routes/paymentRoutes'); // Disabled - using only Razorpay
const razorpayRoutes = require('./routes/razorpayRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');
const addressRoutes = require('./routes/addressRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is from Vercel deployment or localhost
    if (origin.includes('vercel.app') || 
        origin.includes('localhost') || 
        origin === process.env.FRONTEND_URL) {
          
      return callback(null, true);
    }
    
    // Reject other origins
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
function keepAlive() {
  setInterval(async () => {
    try {
      const res = await fetch(SELF_URL);
      console.log(`Self-ping OK: ${res.status}`);
    } catch (err) {
      console.log("Self-ping failed:", err.message);
    }
  }, 10 * 60 * 1000); // every 10 minutes
}

keepAlive();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/', (req, res) => 
  res.json({ message: 'API is working fine', timestamp: new Date().toISOString() }))

app.get('/api/health', (req, res) => 
  res.json({ status: 'OK', timestamp: new Date().toISOString() }))

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/payments', paymentRoutes); // Disabled - using only Razorpay
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api', require('./routes/wishlistCartRoutes'));

axios.get('https://api.ipify.org?format=json')
  .then(res => {
    console.log('Public IP address of this backend:', res.data.ip);
  })
  .catch(err => {
    console.error('Error fetching IP:', err.message);
  });

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      
      console.log(`Server running at ${process.env.PORT || 5000} and DB connected`);
    });
  })
  .catch(err => console.log(err));
