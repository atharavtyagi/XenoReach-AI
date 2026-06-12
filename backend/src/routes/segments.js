const express = require('express');
const { Segment, Customer } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateSegment } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

/**
 * Build a Mongoose query from AI-generated filter object
 */
const buildMongoQuery = (filters) => {
  const query = { isActive: true };
  if (!filters) return query;

  if (filters.minSpend !== undefined) query.totalSpend = { ...query.totalSpend, $gte: filters.minSpend };
  if (filters.maxSpend !== undefined) query.totalSpend = { ...query.totalSpend, $lte: filters.maxSpend };
  if (filters.minOrders !== undefined) query.orderCount = { ...query.orderCount, $gte: filters.minOrders };
  if (filters.maxOrders !== undefined) query.orderCount = { ...query.orderCount, $lte: filters.maxOrders };
  if (filters.inactiveDays !== undefined) {
    const cutoff = new Date(Date.now() - filters.inactiveDays * 24 * 60 * 60 * 1000);
    query.lastOrderDate = { $lt: cutoff };
  }
  if (filters.lastActiveDays !== undefined) {
    const cutoff = new Date(Date.now() - filters.lastActiveDays * 24 * 60 * 60 * 1000);
    query.lastOrderDate = { $gte: cutoff };
  }
  if (filters.cities && filters.cities.length > 0) {
    query.city = { $in: filters.cities };
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.gender) query.gender = filters.gender;
  if (filters.minAge !== undefined) query.age = { ...query.age, $gte: filters.minAge };
  if (filters.maxAge !== undefined) query.age = { ...query.age, $lte: filters.maxAge };

  return query;
};

// GET /api/segments
router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: segments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/segments/:id
router.get('/:id', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id).lean();
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/segments/:id/customers
router.get('/:id/customers', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id).lean();
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });

    const customers = await Customer.find({ _id: { $in: segment.customerIds } })
      .sort({ totalSpend: -1 }).limit(50).lean();

    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/segments/ai-generate — NL → filters → preview
router.post('/ai-generate', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    // Get AI to parse the natural language query
    const aiResult = await generateSegment(query);

    // Execute query against database
    const mongoQuery = buildMongoQuery(aiResult.filters);
    const customers = await Customer.find(mongoQuery).lean();

    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgSpend = customers.length > 0 ? totalRevenue / customers.length : 0;

    res.json({
      success: true,
      data: {
        filters: aiResult.filters,
        suggestedName: aiResult.name,
        description: aiResult.description,
        suggestions: aiResult.suggestions,
        preview: {
          count: customers.length,
          estimatedRevenue: totalRevenue,
          avgSpend: Math.round(avgSpend),
          sampleCustomers: customers.slice(0, 5),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/segments — save segment
router.post('/', async (req, res) => {
  try {
    const { name, description, filters, naturalLanguageQuery, isAiGenerated, suggestions, color } = req.body;

    const mongoQuery = buildMongoQuery(filters);
    const customers = await Customer.find(mongoQuery).select('_id totalSpend').lean();

    const customerIds = customers.map(c => c._id);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgSpend = customers.length > 0 ? totalRevenue / customers.length : 0;

    const segment = await Segment.create({
      name, description, filters, naturalLanguageQuery, isAiGenerated,
      customerIds, customerCount: customerIds.length,
      estimatedRevenue: totalRevenue, avgSpend: Math.round(avgSpend),
      aiSuggestions: suggestions, color: color || '#7C3AED',
      createdBy: req.user._id,
    });

    // Tag customers with this segment
    await Customer.updateMany({ _id: { $in: customerIds } }, { $addToSet: { segments: segment._id } });

    res.status(201).json({ success: true, data: segment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/segments/:id
router.delete('/:id', async (req, res) => {
  try {
    const segment = await Segment.findByIdAndDelete(req.params.id);
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });

    await Customer.updateMany({ segments: req.params.id }, { $pull: { segments: req.params.id } });
    res.json({ success: true, message: 'Segment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
