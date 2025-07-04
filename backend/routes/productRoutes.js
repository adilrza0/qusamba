const express = require('express');
const {
  getAll,
  create,
  getOne,
  update,
  remove
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAll);
router.post('/', protect, adminOnly, create);
router.get('/:id', getOne);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
