const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
    console.error('MONGO_URI not found');
    process.exit(1);
}

async function updateStocks() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Efficiently update all products to have stock and active status
        const productResult = await Product.updateMany(
            {},
            {
                $set: {
                    stock: 100,
                    status: 'active'
                }
            }
        );
        console.log(`Updated ${productResult.modifiedCount} products.`);

        // Update all variants nested in products
        // Note: $[] is the all positional operator to update all elements in an array
        const variantResult = await Product.updateMany(
            { "variants.0": { $exists: true } },
            { $set: { "variants.$[].stock": 100 } }
        );
        console.log(`Updated variants in ${variantResult.modifiedCount} products.`);

        console.log('All stocks updated to 100');
        process.exit(0);
    } catch (error) {
        console.error('Error updating stocks:', error);
        process.exit(1);
    }
}

updateStocks();
