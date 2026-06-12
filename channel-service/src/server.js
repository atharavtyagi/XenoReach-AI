const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const deliverRouter = require('./routes/deliver');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

app.use('/api/deliver', deliverRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'xenoreach-channel', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`📡 XenoReach Channel Service running on http://localhost:${PORT}`);
});
