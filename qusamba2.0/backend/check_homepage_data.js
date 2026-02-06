const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const featuredProducts = await Product.find({ isFeatured: true }).limit(5);
        console.log(`\nFound ${featuredProducts.length} featured products.`);
        featuredProducts.forEach(p => console.log(`- ${p.name}`));

        const categories = await Category.find({ isActive: true });
        console.log(`\nFound ${categories.length} active categories.`);
        categories.forEach(c => console.log(`- ${c.name} (Image: ${c.image || 'None'})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
