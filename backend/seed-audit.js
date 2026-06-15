const mongoose = require('mongoose');
require('dotenv').config();
const { AuditLog } = require('./src/models');

const seedAuditLogs = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xenoreach';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    console.log('Clearing existing audit logs...');
    await AuditLog.deleteMany({});

    const actions = [
      'User Login', 
      'Exported Customers to CSV', 
      'Created New Segment', 
      'Launched Email Campaign', 
      'Generated AI Insights', 
      'Imported CSV Data', 
      'Updated Customer Profile', 
      'Workflow Triggered'
    ];
    const categories = ['auth', 'customer', 'segment', 'campaign', 'ai', 'data_import', 'customer', 'workflow'];
    const statuses = ['success', 'success', 'success', 'success', 'failed', 'pending'];

    const logs = [];
    for (let i = 0; i < 75; i++) {
      const date = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      const actionIndex = Math.floor(Math.random() * actions.length);
      logs.push({
        action: actions[actionIndex],
        category: categories[actionIndex],
        entity: 'System',
        userName: 'Demo Marketer',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        createdAt: date,
        updatedAt: date,
      });
    }

    await AuditLog.insertMany(logs);
    console.log('✅ Seeded 75 Audit Logs successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedAuditLogs();
