const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('cart.product', 'name price images slug stock variants');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                cart: user.cart
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        
        
        
        
        const { productId, quantity = 1, color, size } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = user.cart.findIndex(item => 
            item.product.toString() === productId && 
            item.color === color && 
            item.size === size
        );

        if (existingItemIndex > -1) {
            // Update quantity
            user.cart[existingItemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item
            user.cart.push({
                product: productId,
                quantity: parseInt(quantity),
                color,
                size
            });
        }

        await user.save();

        // Populate the cart before sending response
        await user.populate('cart.product', 'name price images slug stock variants');

        res.status(200).json({
            success: true,
            data: {
                cart: user.cart
            },
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity, color, size } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and quantity are required'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the item to update
        const itemIndex = user.cart.findIndex(item => 
            item.product.toString() === productId && 
            item.color === color && 
            item.size === size
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Update quantity
        user.cart[itemIndex].quantity = parseInt(quantity);
        await user.save();

        // Populate the cart before sending response
        await user.populate('cart.product', 'name price images slug stock variants');

        res.status(200).json({
            success: true,
            data: {
                cart: user.cart
            },
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const { productId, color, size } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find and remove the item
        const itemIndex = user.cart.findIndex(item => 
            item.product.toString() === productId && 
            item.color === color && 
            item.size === size
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        user.cart.splice(itemIndex, 1);
        await user.save();

        // Populate the cart before sending response
        await user.populate('cart.product', 'name price images slug stock variants');

        res.status(200).json({
            success: true,
            data: {
                cart: user.cart
            },
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.cart = [];
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                cart: []
            },
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        
        
        
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'name price images slug stock variants rating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                wishlist: user.wishlist
            }
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        
        
        
        
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if item already exists in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        user.wishlist.push(productId);
        await user.save();

        // Populate the wishlist before sending response
        await user.populate('wishlist', 'name price images slug stock variants rating');

        res.status(200).json({
            success: true,
            data: {
                wishlist: user.wishlist
            },
            message: 'Item added to wishlist successfully'
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/remove
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if item exists in wishlist
        const itemIndex = user.wishlist.indexOf(productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist'
            });
        }

        user.wishlist.splice(itemIndex, 1);
        await user.save();

        // Populate the wishlist before sending response
        await user.populate('wishlist', 'name price images slug stock variants rating');

        res.status(200).json({
            success: true,
            data: {
                wishlist: user.wishlist
            },
            message: 'Item removed from wishlist successfully'
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
exports.clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                wishlist: []
            },
            message: 'Wishlist cleared successfully'
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
