const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing imports...');
try {
    const Product = require('../models/Product');
    console.log('Product model loaded.');
    const Category = require('../models/Category');
    console.log('Category model loaded.');
} catch (e) {
    console.error('Import Error:', e);
}

console.log('Testing DB connection...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('DB Connected.');
        process.exit(0);
    })
    .catch(e => {
        console.error('DB Error:', e);
        process.exit(1);
    });
