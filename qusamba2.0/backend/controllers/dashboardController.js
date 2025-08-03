const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Get current period stats
    const [totalRevenue, totalOrders, totalProducts, totalCustomers] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } }),
      Product.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'customer' })
    ]);

    // Get previous period stats for growth calculation
    const [lastMonthRevenue, lastMonthOrders, lastMonthProducts, lastMonthCustomers] = await Promise.all([
      Order.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: lastYear, $lt: lastMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ 
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        createdAt: { $gte: lastYear, $lt: lastMonth }
      }),
      Product.countDocuments({ 
        status: 'active',
        createdAt: { $gte: lastYear, $lt: lastMonth }
      }),
      User.countDocuments({ 
        role: 'customer',
        createdAt: { $gte: lastYear, $lt: lastMonth }
      })
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const ordersGrowth = lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    const productsGrowth = lastMonthProducts > 0 ? ((totalProducts - lastMonthProducts) / lastMonthProducts) * 100 : 0;
    const customersGrowth = lastMonthCustomers > 0 ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

    // Get recent sales
    const recentSales = await Order.find({
      status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
    })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('user totalAmount orderNumber createdAt');

    // Get sales chart data (last 7 months)
    const salesChart = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          value: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format sales chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSalesChart = salesChart.map(item => ({
      label: months[item._id.month - 1],
      value: item.value
    }));

    // Format recent sales
    const formattedRecentSales = recentSales.map(sale => ({
      id: sale._id,
      customer: sale.user ? `${sale.user.firstName} ${sale.user.lastName}` : 'Guest',
      email: sale.user?.email || 'N/A',
      amount: sale.totalAmount,
      orderNumber: sale.orderNumber,
      date: sale.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: currentRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth,
        ordersGrowth,
        productsGrowth,
        customersGrowth,
        recentSales: formattedRecentSales,
        salesChart: formattedSalesChart
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/admin/dashboard/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { from, to, view = 'all' } = req.query;
    
    let dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    const statusFilter = { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } };
    const matchFilter = { ...statusFilter, ...dateFilter };

    // Get total revenue and orders
    const [revenueStats, totalOrders] = await Promise.all([
      Order.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments(matchFilter)
    ]);

    const totalRevenue = revenueStats[0]?.total || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          category: { $first: '$category.name' },
          orders: { $sum: 1 },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get customer insights
    const customerInsights = await Order.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user._id',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $bucket: {
          groupBy: '$revenue',
          boundaries: [0, 100, 500, 1000, 5000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            revenue: { $sum: '$revenue' }
          }
        }
      }
    ]);

    // Format customer insights
    const segmentLabels = ['$0-$100', '$100-$500', '$500-$1000', '$1000-$5000', '$5000+'];
    const formattedCustomerInsights = customerInsights.map((segment, index) => ({
      segment: segmentLabels[index] || 'Other',
      count: segment.count,
      revenue: segment.revenue
    }));

    // Calculate revenue growth (comparing to previous period)
    const periodLength = to && from ? new Date(to) - new Date(from) : 30 * 24 * 60 * 60 * 1000; // 30 days default
    const previousPeriodEnd = from ? new Date(from) : new Date();
    const previousPeriodStart = new Date(previousPeriodEnd - periodLength);

    const previousRevenue = await Order.aggregate([
      { 
        $match: { 
          ...statusFilter,
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Mock conversion rate (you'd calculate this based on your analytics)
    const conversionRate = 2.5; // 2.5% conversion rate

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueGrowth,
        conversionRate,
        topProducts,
        salesByCategory,
        customerInsights: formattedCustomerInsights
      }
    });

  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get inventory overview
// @route   GET /api/admin/dashboard/inventory
// @access  Private/Admin
exports.getInventoryOverview = async (req, res) => {
  try {
    // Get inventory statistics
    const [totalProducts, lowStockProducts, outOfStockProducts, totalStock] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'active', stock: { $lte: 5, $gt: 0 } }),
      Product.countDocuments({ status: 'active', stock: 0 }),
      Product.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ])
    ]);

    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          category: { $first: '$category.name' },
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get low stock alerts
    const lowStockAlerts = await Product.find({
      status: 'active',
      stock: { $lte: 5, $gt: 0 }
    })
    .select('name stock sku')
    .sort({ stock: 1 })
    .limit(10);

    // Get out of stock products
    const outOfStockAlerts = await Product.find({
      status: 'active',
      stock: 0
    })
    .select('name stock sku')
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalStock: totalStock[0]?.total || 0,
        productsByCategory,
        lowStockAlerts,
        outOfStockAlerts
      }
    });

  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory overview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get order analytics
// @route   GET /api/admin/dashboard/orders
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily orders trend
    const dailyOrders = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get average order processing time
    const processingTimes = await Order.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: { $in: ['delivered', 'shipped'] },
          confirmedAt: { $exists: true }
        } 
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$shippedAt', '$confirmedAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    // Get top customers
    const topCustomers = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          orders: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ordersByStatus,
        dailyOrders,
        averageProcessingTime: processingTimes[0]?.averageProcessingTime || 0,
        topCustomers
      }
    });

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/admin/dashboard/customers
// @access  Private/Admin
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Get customer statistics
    const [totalCustomers, activeCustomers, newCustomers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: lastMonth } })
    ]);

    // Get customer lifetime value
    const customerLTV = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageLTV: { $avg: '$totalSpent' },
          averageOrders: { $avg: '$orderCount' }
        }
      }
    ]);

    // Get customer segments
    const customerSegments = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 100, 500, 1000, 5000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalSpent' }
          }
        }
      }
    ]);

    // Get customer acquisition trend
    const acquisitionTrend = await User.aggregate([
      { 
        $match: { 
          role: 'customer',
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get customer retention rate (simplified)
    const retentionData = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          repeatCustomers: { $sum: { $cond: [{ $gt: ['$orders', 1] }, 1, 0] } },
          totalCustomers: { $sum: 1 }
        }
      }
    ]);

    const retentionRate = retentionData[0] ? 
      (retentionData[0].repeatCustomers / retentionData[0].totalCustomers) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        averageLTV: customerLTV[0]?.averageLTV || 0,
        averageOrders: customerLTV[0]?.averageOrders || 0,
        customerSegments,
        acquisitionTrend,
        retentionRate
      }
    });

  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/dashboard/activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select('orderNumber user totalAmount status createdAt');

    // Get recent products
    const recentProducts = await Product.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select('name createdBy status createdAt');

    // Combine and format activities
    const activities = [];

    recentOrders.forEach(order => {
      activities.push({
        id: order._id,
        type: 'order',
        title: `New order ${order.orderNumber}`,
        description: `Order placed by ${order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}`,
        amount: order.totalAmount,
        status: order.status,
        timestamp: order.createdAt,
        user: order.user
      });
    });

    recentProducts.forEach(product => {
      activities.push({
        id: product._id,
        type: 'product',
        title: `Product ${product.status === 'active' ? 'added' : 'updated'}`,
        description: `"${product.name}" ${product.status === 'active' ? 'was added' : 'was updated'}`,
        status: product.status,
        timestamp: product.createdAt,
        user: product.createdBy
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, limit)
      }
    });

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
