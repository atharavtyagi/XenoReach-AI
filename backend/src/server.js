process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
  setTimeout(() => process.exit(1), 500);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
  setTimeout(() => process.exit(1), 500);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const segmentRoutes = require('./routes/segments');
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const copilotRoutes = require('./routes/copilot');
const integrationRoutes = require('./routes/integrations');
const workflowRoutes = require('./routes/workflows');
const auditRoutes = require('./routes/audit');
const dataQualityRoutes = require('./routes/data-quality');
const insightsRoutes = require('./routes/insights');
const solutionsRoutes = require('./routes/solutions');
const implementationAssistantRoutes = require('./routes/implementation-assistant');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Basic Health Check Route for Diagnostics
app.get('/api/health', (req, res) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xenoreach';
  res.json({
    status: 'ok',
    vercel: !!process.env.VERCEL,
    mongoUri: uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/data-quality', dataQualityRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/implementation-assistant', implementationAssistantRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'xenoreach-crm', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Database connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xenoreach';
    // Remove any accidental spaces or quotes from the Render environment variable
    uri = uri.trim().replace(/^['"]|['"]$/g, '');
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('🔗 Attempting MongoDB connection with URI:', maskedUri);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB connected successfully');

    // Auto-seed on first launch
    const { Customer } = require('./models');
    const count = await Customer.countDocuments();
    if (count === 0) {
      console.log('🌱 No data found — running seed script...');
      require('./scripts/seed')();
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// Connect to DB immediately for serverless compatibility
connectDB();

// Only listen on a port if not running in a Vercel serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 XenoReach CRM Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
