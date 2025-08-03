const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/qusamba', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addTestProduct() {
  try {
    // First, clear any existing products to avoid conflicts
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // First, get a category ID
    const category = await Category.findOne();
    if (!category) {
      console.log('No categories found. Please create a category first.');
      return;
    }

    console.log('Found category:', category.name);

    // Create a test product
    const testProduct = {
      name: 'Elegant Gold Ring',
      slug: 'elegant-gold-ring',
      description: 'A beautiful handcrafted gold ring perfect for special occasions. Made with premium materials and exquisite attention to detail.',
      shortDescription: 'Handcrafted gold ring with elegant design',
      price: 2999.99,
      salePrice: 2499.99,
      costPrice: 1500.00,
      category: category._id,
      material: 'Gold',
      weight: {
        value: 5.2,
        unit: 'grams'
      },
      dimensions: {
        length: 2.0,
        width: 2.0,
        height: 0.8,
        unit: 'cm'
      },
      stock: 25,
      sku: `EGR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      isFeatured: true,
      isOnSale: true,
      images: [
        {
          url: 'https://via.placeholder.com/500x500/FFD700/000000?text=Gold+Ring',
          public_id: 'sample_gold_ring_1',
          alt: 'Elegant Gold Ring - Front View'
        },
        {
          url: 'https://via.placeholder.com/500x500/FFD700/000000?text=Gold+Ring+2',
          public_id: 'sample_gold_ring_2',
          alt: 'Elegant Gold Ring - Side View'
        }
      ],
      tags: ['ring', 'gold', 'jewelry', 'elegant', 'handcrafted'],
      variants: [],
      averageRating: 4.5,
      totalReviews: 12,
      careInstructions: 'Clean with soft cloth. Store in a dry place. Avoid contact with chemicals.',
      warranty: '1 year warranty against manufacturing defects',
      returnPolicy: '30 days return policy',
      metaTitle: 'Elegant Gold Ring - Premium Jewelry',
      metaDescription: 'Shop our elegant gold ring collection. Handcrafted with premium materials.',
      metaKeywords: ['gold ring', 'jewelry', 'elegant', 'handcrafted'],
      viewCount: 150,
      purchaseCount: 8
    };

    const product = await Product.create(testProduct);
    console.log('Test product created successfully!');
    console.log('Product ID:', product._id);
    console.log('Product Name:', product.name);
    console.log('Product Slug:', product.slug);
    
  } catch (error) {
    console.error('Error creating test product:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestProduct();
