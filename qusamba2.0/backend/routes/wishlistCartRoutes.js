const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} = require('../controllers/wishlistCartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Cart routes
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.put('/cart/update', protect, updateCartItem);
router.delete('/cart/remove', protect, removeFromCart);
router.delete('/cart/clear', protect, clearCart);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/add', protect, addToWishlist);
router.delete('/wishlist/remove', protect, removeFromWishlist);
router.delete('/wishlist/clear', protect, clearWishlist);

module.exports = router;
