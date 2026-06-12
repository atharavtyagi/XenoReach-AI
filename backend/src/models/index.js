const mongoose = require('mongoose');

// ─── User ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'marketer', 'viewer'], default: 'marketer' },
  avatar: { type: String },
  company: { type: String, default: 'XenoReach AI' },
}, { timestamps: true });

// ─── Customer ────────────────────────────────────────────────────────────────
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  age: { type: Number },
  tags: [{ type: String }],
  totalSpend: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  firstOrderDate: { type: Date },
  preferredChannel: { type: String, enum: ['Email', 'SMS', 'WhatsApp', 'Push'], default: 'Email' },
  segments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
  aiInsights: { type: String },
  dataQualityScore: { type: Number, default: 100 },
  source: { type: String, enum: ['csv', 'manual', 'api', 'shopify', 'seed'], default: 'manual' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

customerSchema.index({ email: 1 });
customerSchema.index({ totalSpend: -1 });
customerSchema.index({ lastOrderDate: -1 });
customerSchema.index({ city: 1 });

// ─── Order ───────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderNumber: { type: String, unique: true },
  items: [{
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    category: { type: String },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'delivered' },
  channel: { type: String, enum: ['Online', 'In-Store', 'App', 'Phone'], default: 'Online' },
  city: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

orderSchema.index({ customerId: 1 });
orderSchema.index({ createdAt: -1 });

// ─── Segment ─────────────────────────────────────────────────────────────────
const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed }, // Raw filter object from AI
  naturalLanguageQuery: { type: String },
  customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  customerCount: { type: Number, default: 0 },
  estimatedRevenue: { type: Number, default: 0 },
  avgSpend: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAiGenerated: { type: Boolean, default: false },
  aiSuggestions: { type: String },
  color: { type: String, default: '#7C3AED' },
}, { timestamps: true });

// ─── Campaign ─────────────────────────────────────────────────────────────────
const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
  segmentName: { type: String },
  channel: { type: String, enum: ['Email', 'SMS', 'WhatsApp', 'Push', 'Multi-Channel'], default: 'Email' },
  message: { type: String, required: true },
  subject: { type: String },
  goal: { type: String },
  audienceSize: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'], default: 'draft' },
  scheduledAt: { type: Date },
  launchedAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAiGenerated: { type: Boolean, default: false },
  aiMetadata: { type: mongoose.Schema.Types.Mixed },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
}, { timestamps: true });

// ─── Communication ────────────────────────────────────────────────────────────
const communicationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  channel: { type: String },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'opened', 'read', 'clicked', 'converted'],
    default: 'pending',
  },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  openedAt: { type: Date },
  readAt: { type: Date },
  clickedAt: { type: Date },
  convertedAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String },
  revenue: { type: Number, default: 0 },
}, { timestamps: true });

communicationSchema.index({ campaignId: 1 });
communicationSchema.index({ customerId: 1 });

// ─── AnalyticsEvent ───────────────────────────────────────────────────────────
const analyticsEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

analyticsEventSchema.index({ campaignId: 1 });
analyticsEventSchema.index({ timestamp: -1 });

// ─── Workflow ─────────────────────────────────────────────────────────────────
const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  trigger: {
    type: String,
    required: true,
    enum: ['customer_created', 'order_placed', 'high_spender', 'campaign_clicked', 'customer_inactive'],
  },
  triggerConfig: { type: mongoose.Schema.Types.Mixed },
  actions: [{
    type: { type: String, enum: ['send_campaign', 'add_tag', 'add_loyalty_points', 'notify_team', 'add_to_segment'] },
    config: { type: mongoose.Schema.Types.Mixed },
    order: { type: Number },
  }],
  isActive: { type: Boolean, default: true },
  executionCount: { type: Number, default: 0 },
  lastExecutedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ─── AuditLog ─────────────────────────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  category: {
    type: String,
    enum: ['customer', 'campaign', 'segment', 'workflow', 'integration', 'ai', 'data_import', 'auth'],
    default: 'customer',
  },
  entity: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1 });

// ─── Exports ──────────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Order = mongoose.model('Order', orderSchema);
const Segment = mongoose.model('Segment', segmentSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);
const Communication = mongoose.model('Communication', communicationSchema);
const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
const Workflow = mongoose.model('Workflow', workflowSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { User, Customer, Order, Segment, Campaign, Communication, AnalyticsEvent, Workflow, AuditLog };
