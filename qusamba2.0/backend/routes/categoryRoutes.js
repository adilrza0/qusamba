const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected admin routes
router.use(protect, adminOnly);

router.post('/', 
  uploadSingle,
  categoryController.categoryValidationRules,
  categoryController.createCategory
);

router.put('/:id',
  uploadSingle,
  categoryController.categoryValidationRules,
  categoryController.updateCategory
);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
