const express = require('express');
const { AuditLog } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ─── GET /api/audit ────────────────────────────────────────────────────────────
// Paginated list with optional category, status, and search filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/audit/stats ─────────────────────────────────────────────────────
// Aggregated audit statistics for the dashboard
router.get('/stats', async (req, res) => {
  try {
    const [categoryBreakdown, statusBreakdown, recentActivity, totalCount] = await Promise.all([
      // Breakdown by category
      AuditLog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Breakdown by status
      AuditLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Activity in the last 7 days by day
      AuditLog.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        byCategory: categoryBreakdown,
        byStatus: statusBreakdown,
        last7Days: recentActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/audit ───────────────────────────────────────────────────────────
// Manually create an audit log entry (useful for frontend-triggered events)
router.post('/', async (req, res) => {
  try {
    const { action, category, entity, entityId, status, metadata } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, message: 'action is required' });
    }

    const log = await AuditLog.create({
      action,
      category: category || 'customer',
      entity,
      entityId,
      userId: req.user._id,
      userName: req.user.name,
      status: status || 'success',
      metadata,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
