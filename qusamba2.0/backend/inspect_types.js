const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Product = require('./models/Product');

const inspectProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const numericTypeProducts = await Product.find({
            productType: { $regex: /^[0-9]+$/ }
        });

        let output = `Found ${numericTypeProducts.length} products with numeric types:\n\n`;
        numericTypeProducts.forEach(p => {
            output += `- "${p.name}" -> ${p.productType}\n`;
        });

        fs.writeFileSync('numeric_types_samples.txt', output);
        console.log('Samples written to numeric_types_samples.txt');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectProducts();
