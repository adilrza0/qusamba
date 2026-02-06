const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const cleanupTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Evaluating all ${products.length} products for type standardization.`);

        const standardTypes = ['Glass', 'Metal', 'Velvet', 'Thread', 'Seep', 'Acrylic', 'Chuda', 'Kada', 'Bangle'];
        const bulkOps = [];

        for (const product of products) {
            const name = product.name.toLowerCase();
            const desc = (product.description || "").toLowerCase();
            const tags = (product.tags || []).map(t => t.toLowerCase());
            const currentType = (product.productType || "").toLowerCase();

            const allText = `${name} ${desc} ${tags.join(' ')} ${currentType}`;

            let newType = 'Bangle';

            // Material Priority
            if (allText.includes('glass')) {
                newType = 'Glass';
            } else if (allText.includes('metal') || allText.includes('gold plated') ||
                allText.includes('silver') || allText.includes('brass') ||
                allText.includes('kundan')) {
                newType = 'Metal';
            } else if (allText.includes('velvet')) {
                newType = 'Velvet';
            } else if (allText.includes('thread') || allText.includes('silk') ||
                allText.includes('fabric') || allText.includes('lahariya')) {
                newType = 'Thread';
            } else if (allText.includes('seep')) {
                newType = 'Seep';
            } else if (allText.includes('acrylic')) {
                newType = 'Acrylic';
            } else if (allText.includes('chuda') || allText.includes('chura')) {
                newType = 'Chuda';
            } else if (allText.includes('kada')) {
                newType = 'Kada';
            }

            const needsUpdate = !standardTypes.includes(product.productType) || /[0-9]/.test(product.productType);

            if (needsUpdate) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: product._id },
                        update: { productType: newType }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            console.log(`Starting bulk update of ${bulkOps.length} products...`);
            await Product.bulkWrite(bulkOps);
            console.log('Bulk update completed.');
        } else {
            console.log('No products need updating.');
        }

        // Show new distribution
        const newTypes = await Product.distinct('productType');
        console.log('\nNew unique product types:');
        newTypes.forEach(t => console.log(`- "${t}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanupTypes();
