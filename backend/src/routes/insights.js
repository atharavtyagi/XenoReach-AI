const express = require('express');
const { Customer, Campaign, Order, Segment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateExecutiveInsights } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

// ─── GET /api/insights ─────────────────────────────────────────────────────────
// Aggregate key CRM metrics and pass them to Gemini for executive insight generation
router.get('/', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Gather core metrics in parallel for performance
    const [
      totalCustomers,
      activeCustomers,
      newCustomers30d,
      totalCampaigns,
      activeCampaigns,
      totalSegments,
      revenueStats,
      recentOrderStats,
      previousOrderStats,
      topCities,
      campaignStats,
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true, lastOrderDate: { $gte: thirtyDaysAgo } }),
      Customer.countDocuments({ isActive: true, createdAt: { $gte: thirtyDaysAgo } }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: { $in: ['running', 'scheduled'] } }),
      Segment.countDocuments(),

      // Total revenue from all customers
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalSpend' }, avgSpend: { $avg: '$totalSpend' } } },
      ]),

      // Revenue in last 30 days from orders
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      ]),

      // Revenue in the 30 days before that (for MoM comparison)
      Order.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      ]),

      // Top 5 cities by customer count
      Customer.aggregate([
        { $match: { isActive: true, city: { $nin: [null, ''] } } },
        { $group: { _id: '$city', count: { $sum: 1 }, revenue: { $sum: '$totalSpend' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Best performing campaigns
      Campaign.aggregate([
        { $match: { status: 'completed' } },
        {
          $project: {
            name: 1,
            channel: 1,
            'stats.sent': 1,
            'stats.converted': 1,
            'stats.revenue': 1,
            conversionRate: {
              $cond: [
                { $gt: ['$stats.sent', 0] },
                { $divide: ['$stats.converted', '$stats.sent'] },
                0,
              ],
            },
          },
        },
        { $sort: { conversionRate: -1 } },
        { $limit: 3 },
      ]),
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, avgSpend: 0 };
    const recent = recentOrderStats[0] || { revenue: 0, orders: 0 };
    const previous = previousOrderStats[0] || { revenue: 0, orders: 0 };
    const revenueGrowth = previous.revenue > 0
      ? Math.round(((recent.revenue - previous.revenue) / previous.revenue) * 100)
      : 0;

    const metrics = {
      customers: {
        total: totalCustomers,
        active30d: activeCustomers,
        new30d: newCustomers30d,
        churnRate: totalCustomers > 0
          ? Math.round(((totalCustomers - activeCustomers) / totalCustomers) * 100)
          : 0,
      },
      revenue: {
        lifetime: Math.round(revenue.totalRevenue),
        last30Days: Math.round(recent.revenue),
        previous30Days: Math.round(previous.revenue),
        growth: revenueGrowth,
        avgCustomerValue: Math.round(revenue.avgSpend),
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        topPerformers: campaignStats,
      },
      segments: { total: totalSegments },
      geography: { topCities },
      orders: {
        last30Days: recent.orders,
        previous30Days: previous.orders,
      },
    };

    // Generate AI executive insights based on the real data
    const insights = await generateExecutiveInsights(metrics);

    res.json({
      success: true,
      data: { metrics, insights },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
