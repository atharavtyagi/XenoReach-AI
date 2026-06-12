const express = require('express');
const { Customer } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateDataQualityFixes } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

// ─── GET /api/data-quality/analysis ───────────────────────────────────────────
// Aggregate missing / incomplete fields across the entire Customer collection
router.get('/analysis', async (req, res) => {
  try {
    const [total, results] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            missingPhone: {
              $sum: { $cond: [{ $or: [{ $eq: ['$phone', null] }, { $eq: ['$phone', ''] }] }, 1, 0] },
            },
            missingCity: {
              $sum: { $cond: [{ $or: [{ $eq: ['$city', null] }, { $eq: ['$city', ''] }] }, 1, 0] },
            },
            missingAge: {
              $sum: { $cond: [{ $eq: ['$age', null] }, 1, 0] },
            },
            missingGender: {
              $sum: { $cond: [{ $eq: ['$gender', null] }, 1, 0] },
            },
            missingLastOrder: {
              $sum: { $cond: [{ $eq: ['$lastOrderDate', null] }, 1, 0] },
            },
            noTags: {
              $sum: { $cond: [{ $eq: [{ $size: { $ifNull: ['$tags', []] } }, 0] }, 1, 0] },
            },
            zeroSpend: {
              $sum: { $cond: [{ $eq: ['$totalSpend', 0] }, 1, 0] },
            },
            lowQualityScore: {
              $sum: { $cond: [{ $lt: ['$dataQualityScore', 70] }, 1, 0] },
            },
            avgQualityScore: { $avg: '$dataQualityScore' },
          },
        },
      ]),
    ]);

    const stats = results[0] || {};

    // Compute completeness percentages for each field
    const fields = [
      { field: 'phone', label: 'Phone Number', missing: stats.missingPhone || 0 },
      { field: 'city', label: 'City', missing: stats.missingCity || 0 },
      { field: 'age', label: 'Age', missing: stats.missingAge || 0 },
      { field: 'gender', label: 'Gender', missing: stats.missingGender || 0 },
      { field: 'lastOrderDate', label: 'Last Order Date', missing: stats.missingLastOrder || 0 },
      { field: 'tags', label: 'Tags / Labels', missing: stats.noTags || 0 },
    ];

    const fieldAnalysis = fields.map(f => ({
      field: f.field,
      label: f.label,
      missing: f.missing,
      completeness: total > 0 ? Math.round(((total - f.missing) / total) * 100) : 100,
      impact: f.missing > total * 0.3 ? 'high' : f.missing > total * 0.1 ? 'medium' : 'low',
    }));

    // Overall health score
    const overallScore = Math.round(stats.avgQualityScore || 0);
    const healthGrade =
      overallScore >= 90 ? 'A' :
      overallScore >= 75 ? 'B' :
      overallScore >= 60 ? 'C' :
      overallScore >= 40 ? 'D' : 'F';

    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers: total,
          avgQualityScore: overallScore,
          healthGrade,
          lowQualityCount: stats.lowQualityScore || 0,
          zeroSpendCount: stats.zeroSpend || 0,
        },
        fieldAnalysis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/data-quality/ai-fixes ──────────────────────────────────────────
// Send a sample of low-quality records to Gemini and get actionable fix suggestions
router.post('/ai-fixes', async (req, res) => {
  try {
    // Pull a sample of customers with poor quality scores or missing data
    const sampleCustomers = await Customer.find({
      isActive: true,
      $or: [
        { dataQualityScore: { $lt: 70 } },
        { phone: { $in: [null, ''] } },
        { city: { $in: [null, ''] } },
        { age: null },
      ],
    })
      .select('name email phone city age gender tags totalSpend orderCount dataQualityScore')
      .limit(20)
      .lean();

    if (sampleCustomers.length === 0) {
      return res.json({
        success: true,
        data: {
          fixes: [],
          message: 'Your customer data quality is excellent — no critical issues found!',
        },
      });
    }

    const fixes = await generateDataQualityFixes(sampleCustomers);

    res.json({ success: true, data: { fixes, sampleSize: sampleCustomers.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
