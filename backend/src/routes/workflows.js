const express = require('express');
const { Workflow, AuditLog } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ─── GET /api/workflows ────────────────────────────────────────────────────────
// Returns all workflows, sorted by newest first
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: workflows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/workflows/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/workflows ───────────────────────────────────────────────────────
// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const { name, description, trigger, triggerConfig, actions, isActive } = req.body;

    if (!name || !trigger) {
      return res.status(400).json({ success: false, message: 'name and trigger are required' });
    }

    const workflow = await Workflow.create({
      name,
      description,
      trigger,
      triggerConfig: triggerConfig || {},
      actions: actions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    // Log the creation in audit trail
    await AuditLog.create({
      action: `Workflow "${name}" created`,
      category: 'workflow',
      entity: 'Workflow',
      entityId: workflow._id,
      userId: req.user._id,
      userName: req.user.name,
      status: 'success',
      metadata: { trigger, actionCount: (actions || []).length },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/workflows/:id ────────────────────────────────────────────────────
// Update an existing workflow
router.put('/:id', async (req, res) => {
  try {
    const { name, description, trigger, triggerConfig, actions, isActive } = req.body;

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, description, trigger, triggerConfig, actions, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    // Audit the update
    await AuditLog.create({
      action: `Workflow "${workflow.name}" updated`,
      category: 'workflow',
      entity: 'Workflow',
      entityId: workflow._id,
      userId: req.user._id,
      userName: req.user.name,
      status: 'success',
      metadata: { changes: req.body },
      ipAddress: req.ip,
    });

    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/workflows/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    // Audit the deletion
    await AuditLog.create({
      action: `Workflow "${workflow.name}" deleted`,
      category: 'workflow',
      entity: 'Workflow',
      entityId: workflow._id,
      userId: req.user._id,
      userName: req.user.name,
      status: 'success',
      metadata: { trigger: workflow.trigger },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/workflows/:id/execute ──────────────────────────────────────────
// Manually trigger a workflow execution (simulated)
router.post('/:id/execute', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    if (!workflow.isActive) {
      return res.status(400).json({ success: false, message: 'Workflow is inactive and cannot be executed' });
    }

    // Increment execution counters
    workflow.executionCount += 1;
    workflow.lastExecutedAt = new Date();
    await workflow.save();

    // Record the execution in the audit log
    await AuditLog.create({
      action: `Workflow "${workflow.name}" executed manually`,
      category: 'workflow',
      entity: 'Workflow',
      entityId: workflow._id,
      userId: req.user._id,
      userName: req.user.name,
      status: 'success',
      metadata: {
        trigger: workflow.trigger,
        actionCount: workflow.actions.length,
        executionCount: workflow.executionCount,
        triggeredBy: 'manual',
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Workflow "${workflow.name}" executed successfully`,
      data: {
        workflowId: workflow._id,
        executionCount: workflow.executionCount,
        lastExecutedAt: workflow.lastExecutedAt,
        actionsTriggered: workflow.actions.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
