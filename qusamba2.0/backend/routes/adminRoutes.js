const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.use('/dashboard', require('./dashboardRoutes'));

// User management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/stats')
  .get(getUserStats);

router.route('/users/:id')
  .get(getUserById)
  .put([
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('firstName')
      .optional()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['customer', 'admin'])
      .withMessage('Role must be either customer or admin'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ], updateUser)
  .delete(deleteUser);

router.route('/users/:id/status')
  .patch([
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ], toggleUserStatus);

module.exports = router;
