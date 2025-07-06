const express = require('express');
const {
  getAll,
  create,
  getOne: getById,
  update,
  remove: deleteProduct,
  search,
  addReview
} = require('../controllers/productController');
const { uploadMultiple: uploadImages } = require('../middleware/uploadMiddleware');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateProduct = [
  (req, res, next) => {
    console.log('validateProduct: Request body received:', req.body);
    next();
  },
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Product category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  (req, res, next) => {
    console.log('validateProduct: Running validation checks');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('validateProduct: Validation errors found:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('validateProduct: Validation passed, proceeding to controller');
    next();
  }
];

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Review comment is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Product routes
router.get('/', getAll);
router.get('/search', search);
router.post('/', protect, adminOnly, uploadImages, validateProduct, create);
router.get('/:id', getById);
router.put('/:id', protect, adminOnly, uploadImages, validateProduct, update);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Review routes
router.post('/:id/reviews', protect, validateReview, addReview);

module.exports = router;
