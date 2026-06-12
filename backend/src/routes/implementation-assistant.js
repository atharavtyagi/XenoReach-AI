const express = require('express');
const { Customer, Campaign, Segment, Workflow } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateImplementationAdvice } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

// ─── POST /api/implementation-assistant/chat ────────────────────────────────
// Multi-turn chat endpoint for implementation / strategy advice.
// Automatically injects live DB metrics into the AI context.
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    // Build a rich context snapshot from the live database
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      activeCustomers,
      totalCampaigns,
      completedCampaigns,
      totalSegments,
      activeWorkflows,
      revenueAgg,
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true, lastOrderDate: { $gte: thirtyDaysAgo } }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'completed' }),
      Segment.countDocuments(),
      Workflow.countDocuments({ isActive: true }),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalSpend' }, avg: { $avg: '$totalSpend' } } },
      ]),
    ]);

    const rev = revenueAgg[0] || { total: 0, avg: 0 };

    const dbContext = {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      churnRate: totalCustomers > 0
        ? Math.round(((totalCustomers - activeCustomers) / totalCustomers) * 100)
        : 0,
      totalCampaigns,
      completedCampaigns,
      totalSegments,
      activeWorkflows,
      totalRevenue: Math.round(rev.total),
      avgCustomerValue: Math.round(rev.avg),
    };

    const result = await generateImplementationAdvice(message.trim(), dbContext, history);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
