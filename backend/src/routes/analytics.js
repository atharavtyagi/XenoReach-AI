const express = require('express');
const { Campaign, Communication, Customer, Order, AnalyticsEvent } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/analytics/callback — receives events from Channel Service (no auth required)
router.post('/callback', async (req, res) => {
  try {
    const { communicationId, campaignId, customerId, status, revenue, timestamp } = req.body;

    const updateData = { status };
    const now = new Date(timestamp || Date.now());

    if (status === 'delivered') updateData.deliveredAt = now;
    else if (status === 'opened') updateData.openedAt = now;
    else if (status === 'read') updateData.readAt = now;
    else if (status === 'clicked') updateData.clickedAt = now;
    else if (status === 'converted') { updateData.convertedAt = now; updateData.revenue = revenue || 0; }
    else if (status === 'failed') { updateData.failedAt = now; updateData.failureReason = req.body.reason || 'Unknown'; }

    await Communication.findByIdAndUpdate(communicationId, updateData);

    // Update campaign stats
    const statField = status;
    const statUpdate = { $inc: {} };
    statUpdate.$inc[`stats.${statField}`] = 1;
    if (status === 'converted' && revenue) statUpdate.$inc['stats.revenue'] = revenue;

    await Campaign.findByIdAndUpdate(campaignId, statUpdate);

    // Log analytics event
    await AnalyticsEvent.create({
      type: `campaign.${status}`,
      campaignId,
      customerId,
      communicationId,
      metadata: { revenue, status },
      timestamp: now,
    });

    // Check if campaign is complete
    const campaign = await Campaign.findById(campaignId);
    if (campaign && campaign.stats.delivered + campaign.stats.failed >= campaign.stats.sent) {
      await Campaign.findByIdAndUpdate(campaignId, { status: 'completed', completedAt: new Date() });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Analytics callback error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// All routes below require auth
router.use(authenticate);

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const [
      totalCustomers,
      totalCampaigns,
      customerGrowth,
      revenueAgg,
      campaignStats,
      topCities,
      recentCampaigns,
      spendDistribution,
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Campaign.countDocuments(),
      Customer.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalSpend' }, avg: { $avg: '$totalSpend' } } },
      ]),
      Campaign.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSent: { $sum: '$stats.sent' },
            totalDelivered: { $sum: '$stats.delivered' },
            totalOpened: { $sum: '$stats.opened' },
            totalClicked: { $sum: '$stats.clicked' },
            totalConverted: { $sum: '$stats.converted' },
            totalRevenue: { $sum: '$stats.revenue' },
          },
        },
      ]),
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$city', count: { $sum: 1 }, revenue: { $sum: '$totalSpend' } } },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
      Campaign.find().sort({ createdAt: -1 }).limit(5).lean(),
      Customer.aggregate([
        { $match: { isActive: true } },
        {
          $bucket: {
            groupBy: '$totalSpend',
            boundaries: [0, 1000, 5000, 10000, 25000, 50000, 100000],
            default: '100000+',
            output: { count: { $sum: 1 }, revenue: { $sum: '$totalSpend' } },
          },
        },
      ]),
    ]);

    // Aggregate campaign totals
    let totalSent = 0, totalDelivered = 0, totalOpened = 0, totalClicked = 0, totalConverted = 0, totalRevenue = 0;
    campaignStats.forEach(s => {
      totalSent += s.totalSent;
      totalDelivered += s.totalDelivered;
      totalOpened += s.totalOpened;
      totalClicked += s.totalClicked;
      totalConverted += s.totalConverted;
      totalRevenue += s.totalRevenue;
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          totalCampaigns,
          totalRevenue: revenueAgg[0]?.total || 0,
          avgCustomerSpend: Math.round(revenueAgg[0]?.avg || 0),
          deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
          openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
          clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0,
          conversionRate: totalClicked > 0 ? Math.round((totalConverted / totalClicked) * 100) : 0,
          campaignRevenue: totalRevenue,
        },
        customerGrowth,
        campaignStats,
        topCities,
        recentCampaigns,
        spendDistribution,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/campaigns — campaign performance list
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    const enriched = campaigns.map(c => ({
      ...c,
      deliveryRate: c.stats.sent > 0 ? Math.round((c.stats.delivered / c.stats.sent) * 100) : 0,
      openRate: c.stats.delivered > 0 ? Math.round((c.stats.opened / c.stats.delivered) * 100) : 0,
      clickRate: c.stats.opened > 0 ? Math.round((c.stats.clicked / c.stats.opened) * 100) : 0,
      conversionRate: c.stats.clicked > 0 ? Math.round((c.stats.converted / c.stats.clicked) * 100) : 0,
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
