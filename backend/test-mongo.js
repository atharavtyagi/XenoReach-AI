const mongoose = require('mongoose');

const uri = 'mongodb://atharav:Atharav%242608@ac-c8t3krf-shard-00-00.b8e4hcy.mongodb.net:27017,ac-c8t3krf-shard-00-01.b8e4hcy.mongodb.net:27017,ac-c8t3krf-shard-00-02.b8e4hcy.mongodb.net:27017/xenoreach?ssl=true&replicaSet=atlas-e22nzk-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected successfully from AI environment');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
