const mongoose = require('mongoose');

const forceSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://mongo:RDKFlqHAEpGAoUigAHXHTwfiGnsxAOUC@thomas.proxy.rlwy.net:40446');
    console.log('Connected! Running seed script...');
    
    const seedDB = require('./src/scripts/seed');
    await seedDB();
    
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Force seed error:', err);
    process.exit(1);
  }
};

forceSeed();
