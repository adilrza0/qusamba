const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { active, parent, includeSubcategories } = req.query;
    
    let query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (parent !== undefined) query.parent = parent === 'null' ? null : parent;
    
    let categories;
    if (includeSubcategories === 'true') {
      categories = await Category.find(query)
        .populate('subcategories')
        .sort({ sortOrder: 1, name: 1 });
    } else {
      categories = await Category.find(query)
        .sort({ sortOrder: 1, name: 1 });
    }
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('subcategories')
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug })
      .populate('subcategories')
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const categoryData = req.body;
    
    // Handle image upload
    if (req.file) {
      categoryData.image = req.file.path; // Cloudinary URL
    }
    
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Handle image upload
    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parent: id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.'
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// Get category tree (hierarchical structure)
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });
    
    // Build tree structure
    const categoryMap = {};
    const tree = [];
    
    // First pass: create lookup map
    categories.forEach(cat => {
      categoryMap[cat._id] = {
        ...cat.toObject(),
        children: []
      };
    });
    
    // Second pass: build tree
    categories.forEach(cat => {
      if (cat.parent) {
        if (categoryMap[cat.parent]) {
          categoryMap[cat.parent].children.push(categoryMap[cat._id]);
        }
      } else {
        tree.push(categoryMap[cat._id]);
      }
    });
    
    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category tree',
      error: error.message
    });
  }
};

// Validation rules
exports.categoryValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category name is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Meta title cannot exceed 100 characters'),
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Meta description cannot exceed 200 characters')
];
