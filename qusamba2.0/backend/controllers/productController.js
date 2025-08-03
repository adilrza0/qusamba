const Product = require('../models/Product');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res) => {
  console.log('Get all products endpoint hit');
  try {
    const { page = 1, limit = 10, category, priceMin, priceMax, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query filters
    const query = {};
   
    if (category!=="undefined") query.category = category;
   
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    console.log(query)
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

     
    console.log(`Fetched ${products.length} products for page ${page} with limit ${limit}`);
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  console.log('Create product endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const productData = { ...req.body };
    
    // Handle category conversion from name to ObjectId
    if (productData.category && typeof productData.category === 'string') {
      const Category = require('../models/Category');
      let category = await Category.findOne({ name: productData.category });
      
      if (!category) {
        // Create category if it doesn't exist
        category = await Category.create({
          name: productData.category,
          slug: productData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
        console.log('Created new category:', category);
      }
      
      productData.category = category._id;
    }
    
    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const namePrefix = productData.name ? productData.name.substring(0, 3).toUpperCase() : 'PRD';
      productData.sku = `${namePrefix}-${timestamp}`;
    }
    
    // Set default material if not provided
    if (!productData.material) {
      productData.material = 'Other';
    }
    
    // Generate slug from name
    if (productData.name) {
      productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    // Parse variants data if provided
    if (productData.variants && typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
        console.log('Parsed variants:', productData.variants);
      } catch (error) {
        console.error('Error parsing variants:', error);
        productData.variants = [];
      }
    }
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files:', req.files.length);
      const mainImages = [];
      const variantImagesMap = {};
      
      req.files.forEach(file => {
        const variantMatch = file.fieldname.match(/^variant_(\d+)_images$/);
        if (variantMatch) {
          const variantIndex = Number(variantMatch[1]);
          if (!variantImagesMap[variantIndex]) {
            variantImagesMap[variantIndex] = [];
          }
          variantImagesMap[variantIndex].push({
            url: file.path,
            public_id: file.filename,
            alt: req.body.name || 'Variant image'
          });
        } else {
          mainImages.push({
            url: file.path,
            public_id: file.filename,
            alt: req.body.name || 'Product image'
          });
        }
      });
      
      // Set main images or default placeholder if no main images
      if (mainImages.length > 0) {
        productData.images = mainImages;
      } else if (Object.keys(variantImagesMap).length === 0) {
        // Only set placeholder if no images at all
        productData.images = [{
          url: 'https://via.placeholder.com/400x400?text=No+Image',
          public_id: 'placeholder',
          alt: 'Placeholder image'
        }];
      } else {
        productData.images = [];
      }
      
      if (productData.variants) {
        productData.variants = productData.variants.map((variant, idx) => ({
          ...variant,
          images: variantImagesMap[idx] || []
        }));
      }
      
      console.log('Processed images:', productData.images);
      console.log('Processed variants:', productData.variants);
    } else {
      console.log('No files uploaded - setting default image');
      // If no images uploaded, set a default placeholder
      productData.images = [{
        url: 'https://via.placeholder.com/400x400?text=No+Image',
        public_id: 'placeholder',
        alt: 'Placeholder image'
      }];
    }
    
    console.log('Creating product with data:', productData);
    const product = await Product.create(productData);
    await product.populate('category', 'name slug');
    
    console.log('Product created successfully:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'username');
      
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  console.log('Update product endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const updateData = { ...req.body };
    
    // Handle category conversion from name to ObjectId
    if (updateData.category && typeof updateData.category === 'string') {
      const Category = require('../models/Category');
      let category = await Category.findOne({ name: updateData.category });
      
      if (!category) {
        // Create category if it doesn't exist
        category = await Category.create({
          name: updateData.category,
          slug: updateData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
        console.log('Created new category:', category);
      }
      
      updateData.category = category._id;
    }
    
    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    // Parse variants data if provided
    if (updateData.variants && typeof updateData.variants === 'string') {
      try {
        updateData.variants = JSON.parse(updateData.variants);
        console.log('Parsed variants for update:', updateData.variants);
      } catch (error) {
        console.error('Error parsing variants for update:', error);
        updateData.variants = [];
      }
    }
    
    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const mainImages = [];
      const variantImagesMap = {};
      
      req.files.forEach(file => {
        const variantMatch = file.fieldname.match(/^variant_(\d+)_images$/);
        if (variantMatch) {
          const variantIndex = Number(variantMatch[1]);
          if (!variantImagesMap[variantIndex]) {
            variantImagesMap[variantIndex] = [];
          }
          variantImagesMap[variantIndex].push({
            url: file.path,
            public_id: file.filename,
            alt: req.body.name || 'Variant image'
          });
        } else {
          mainImages.push({
            url: file.path,
            public_id: file.filename,
            alt: req.body.name || 'Product image'
          });
        }
      });
      
      // Handle main product images
      if (mainImages.length > 0) {
        if (req.body.keepExisting === 'true') {
          const existingProduct = await Product.findById(req.params.id);
          updateData.images = [...(existingProduct.images || []), ...mainImages];
        } else {
          updateData.images = mainImages;
        }
      }
      
      // Handle variant images
      if (updateData.variants && Object.keys(variantImagesMap).length > 0) {
        updateData.variants = updateData.variants.map((variant, idx) => ({
          ...variant,
          images: variantImagesMap[idx] || variant.images || []
        }));
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .populate('category', 'name slug')
      .skip(skip)
      .limit(Number(limit));
      
    const total = await Product.countDocuments({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    });
    
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };
    
    product.reviews.push(review);
    
    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.avgRating = totalRating / product.reviews.length;
    
    await product.save();
    
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
