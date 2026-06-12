const express = require('express');
const axios = require('axios');
const { Campaign, Segment, Customer, Communication } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateCampaign } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [campaigns, total] = await Promise.all([
      Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('segmentId', 'name customerCount').lean(),
      Campaign.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: campaigns,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId', 'name customerCount estimatedRevenue').lean();
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const communications = await Communication.find({ campaignId: req.params.id })
      .sort({ createdAt: -1 }).limit(20).populate('customerId', 'name email').lean();

    res.json({ success: true, data: { ...campaign, communications } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/campaigns/:id/analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // Status distribution
    const statusAgg = await Communication.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Timeline (hourly events)
    const timeline = await Communication.aggregate([
      { $match: { campaignId: campaign._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$updatedAt' } },
          events: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        campaign,
        statusDistribution: statusAgg,
        timeline,
        funnel: {
          sent: campaign.stats.sent,
          delivered: campaign.stats.delivered,
          opened: campaign.stats.opened,
          clicked: campaign.stats.clicked,
          converted: campaign.stats.converted,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns/ai-generate
router.post('/ai-generate', async (req, res) => {
  try {
    const { goal, segmentId } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'Campaign goal is required' });

    let segmentInfo = null;
    if (segmentId) {
      segmentInfo = await Segment.findById(segmentId).lean();
    }

    const aiResult = await generateCampaign(goal, segmentInfo);
    res.json({ success: true, data: aiResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns
router.post('/', async (req, res) => {
  try {
    const { name, description, segmentId, channel, message, subject, goal, isAiGenerated, aiMetadata } = req.body;

    let audienceSize = 0;
    let segmentName = '';
    if (segmentId) {
      const segment = await Segment.findById(segmentId).lean();
      if (segment) {
        audienceSize = segment.customerCount;
        segmentName = segment.name;
      }
    }

    const campaign = await Campaign.create({
      name, description, segmentId, segmentName, channel, message, subject, goal,
      audienceSize, isAiGenerated, aiMetadata,
      createdBy: req.user._id,
      status: 'draft',
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns/:id/launch
router.post('/:id/launch', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Campaign already launched' });
    }

    // Get segment customers
    const segment = await Segment.findById(campaign.segmentId).lean();
    if (!segment || !segment.customerIds?.length) {
      return res.status(400).json({ success: false, message: 'No customers in segment' });
    }

    const customers = await Customer.find({ _id: { $in: segment.customerIds } })
      .select('name email phone preferredChannel').lean();

    // Create communication records
    const communications = await Communication.insertMany(
      customers.map(c => ({
        campaignId: campaign._id,
        customerId: c._id,
        channel: campaign.channel,
        message: campaign.message,
        status: 'sent',
        sentAt: new Date(),
      }))
    );

    // Update campaign
    await Campaign.findByIdAndUpdate(campaign._id, {
      status: 'running',
      launchedAt: new Date(),
      'stats.sent': customers.length,
    });

    // Send to Channel Service asynchronously
    const channelUrl = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';
    const payload = {
      campaignId: campaign._id,
      campaignName: campaign.name,
      channel: campaign.channel,
      crmCallbackUrl: process.env.CRM_CALLBACK_URL || 'http://localhost:5000/api/analytics/callback',
      communications: communications.map((comm, i) => ({
        communicationId: comm._id,
        customerId: customers[i]._id,
        customerName: customers[i].name,
        email: customers[i].email,
        message: campaign.message,
      })),
    };

    // Fire and forget to channel service
    axios.post(`${channelUrl}/api/deliver`, payload).catch(err => {
      console.error('Channel service error:', err.message);
    });

    res.json({
      success: true,
      message: `Campaign launched to ${customers.length} customers`,
      audienceSize: customers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/campaigns/:id
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
