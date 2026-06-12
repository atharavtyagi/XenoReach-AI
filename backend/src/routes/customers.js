const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { Customer, Order } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateCustomerInsights } = require('../services/gemini');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All routes require authentication
router.use(authenticate);

// GET /api/customers — paginated, searchable, filterable
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search = '', city, minSpend, maxSpend,
      tag, segment, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (city) query.city = { $regex: city, $options: 'i' };
    if (minSpend) query.totalSpend = { ...query.totalSpend, $gte: Number(minSpend) };
    if (maxSpend) query.totalSpend = { ...query.totalSpend, $lte: Number(maxSpend) };
    if (tag) query.tags = { $in: [tag] };
    if (segment) query.segments = segment;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalCustomers, agg] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalSpend' },
            avgSpend: { $avg: '$totalSpend' },
            avgOrders: { $avg: '$orderCount' },
          },
        },
      ]),
    ]);

    const cityBreakdown = await Customer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 }, revenue: { $sum: '$totalSpend' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalRevenue: agg[0]?.totalRevenue || 0,
        avgSpend: Math.round(agg[0]?.avgSpend || 0),
        avgOrders: Math.round(agg[0]?.avgOrders || 0),
        cityBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ customerId: req.params.id }).sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, data: { ...customer, recentOrders: orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, source: 'manual' });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Customer deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers/upload-csv
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    const customers = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      try {
        const existing = await Customer.findOne({ email: row.email?.toLowerCase() });
        if (existing) {
          // Update existing customer
          await Customer.findByIdAndUpdate(existing._id, {
            totalSpend: Number(row.totalSpend) || existing.totalSpend,
            orderCount: Number(row.orderCount) || existing.orderCount,
          });
          customers.push({ updated: true, email: row.email });
        } else {
          const c = await Customer.create({
            name: row.name || row.Name,
            email: row.email || row.Email,
            phone: row.phone || row.Phone,
            city: row.city || row.City,
            state: row.state || row.State,
            gender: row.gender || row.Gender,
            age: Number(row.age) || undefined,
            totalSpend: Number(row.totalSpend || row.total_spend) || 0,
            orderCount: Number(row.orderCount || row.order_count) || 0,
            lastOrderDate: row.lastOrderDate ? new Date(row.lastOrderDate) : undefined,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            source: 'csv',
          });
          customers.push({ created: true, email: c.email });
        }
      } catch (e) {
        errors.push({ row: i + 1, error: e.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${records.length} records`,
      created: customers.filter(c => c.created).length,
      updated: customers.filter(c => c.updated).length,
      errors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers/:id/insights — AI-generated insights
router.post('/:id/insights', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ customerId: req.params.id }).sort({ createdAt: -1 }).limit(5).lean();
    const insights = await generateCustomerInsights(customer, orders);

    await Customer.findByIdAndUpdate(req.params.id, { aiInsights: insights });
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
