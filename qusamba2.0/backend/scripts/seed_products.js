const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGO_URI or MONGODB_URI not found in environment variables');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const importData = async () => {
    try {
        const dataPath = path.join('c:', 'Users', 'adilr', '.openclaw', 'workspace', 'golden_cascade_products.json');

        if (!fs.existsSync(dataPath)) {
            console.error(`File not found at ${dataPath}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const products = jsonData.products || [];

        console.log(`Found ${products.length} source products. Clearing existing products...`);

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products database.');

        // Find or Create categories
        let defaultCategory = await Category.findOne({ name: 'General' });
        if (!defaultCategory) {
            defaultCategory = await Category.create({
                name: 'General',
                slug: 'general',
                description: 'General category for imported products'
            });
        }

        const BATCH_SIZE = 50;
        let processedCount = 0;

        // Helper to determine material
        const getMaterial = (p) => {
            let material = 'Other';
            const descriptionLower = p.description.toLowerCase();
            const tagsLower = p.tags.map(t => t.toLowerCase());

            if (tagsLower.some(t => t.includes('glass')) || descriptionLower.includes('glass')) material = 'Glass';
            else if (tagsLower.some(t => t.includes('wood')) || descriptionLower.includes('wood')) material = 'Wood';
            else if (tagsLower.some(t => t.includes('seep')) || descriptionLower.includes('seep')) material = 'Seep';
            else if (tagsLower.some(t => t.includes('fabric')) || descriptionLower.includes('fabric')) material = 'Fabric';
            else if (tagsLower.some(t => t.includes('metal')) || descriptionLower.includes('metal')) material = 'Metal';
            return material;
        };

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (p) => {
                try {
                    // Check for Color option to help with image mapping
                    const colorOptionIndex = p.options.findIndex(opt => opt.name.toLowerCase() === 'color');
                    const colorOptionPosition = colorOptionIndex !== -1 ? p.options[colorOptionIndex].position : null; // 1, 2, or 3

                    // Map variants with image mapping
                    const variants = p.variants.map(v => {
                        let variantColor = 'Default';
                        if (colorOptionPosition === 1) variantColor = v.option1;
                        else if (colorOptionPosition === 2) variantColor = v.option2;
                        else if (colorOptionPosition === 3) variantColor = v.option3;

                        // Find images matching this color
                        let variantImages = [];
                        if (variantColor && variantColor !== 'Default') {
                            variantImages = p.images.filter(img =>
                                img.src.toLowerCase().includes(variantColor.toLowerCase())
                            ).map(img => ({
                                url: img.src,
                                public_id: `shopify_${img.id}`,
                                alt: `${p.title} - ${variantColor}`
                            }));
                        }

                        return {
                            color: v.option1 || 'Default',
                            size: v.option2 || 'One Size',
                            stock: 100,
                            price: parseFloat(v.price),
                            sku: v.sku || `SKU-${v.id}`,
                            images: variantImages // Assign specific images to variant
                        };
                    });

                    // Product level images (all images)
                    const productImages = p.images.map(img => ({
                        url: img.src,
                        public_id: `shopify_${img.id}`,
                        alt: p.title
                    }));

                    const productData = {
                        name: p.title,
                        slug: p.handle,
                        description: p.description,
                        price: parseFloat(p.variants[0]?.price || 0),
                        images: productImages,
                        category: defaultCategory._id,
                        tags: p.tags,
                        material: getMaterial(p),
                        vendor: p.vendor,
                        productType: p.product_type,
                        stock: 100,
                        sku: p.variants[0]?.sku || `SKU-${p.id}`,
                        variants: variants,
                        status: 'active'
                    };

                    await Product.create(productData);

                } catch (err) {
                    console.error(`Error processing ${p.handle}:`, err.message);
                }
            }));

            processedCount += batch.length;
            process.stdout.write(`Processed ${processedCount} / ${products.length} sources\r`);
        }

        console.log('\nData Consolidation & Import Completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
