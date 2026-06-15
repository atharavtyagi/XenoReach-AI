const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://atharav:Atharav$2608@cluster0.b8e4hcy.mongodb.net/xenoreach?appName=Cluster0')
  .then(async () => {
    const User = require('./src/models/User');
    const users = await User.find({});
    console.log(users);
    process.exit(0);
  })
  .catch(console.error);
