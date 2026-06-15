const { AuditLog } = require('../models');

const auditLogger = async (req, res, next) => {
  // Capture original res.send to intercept the response status
  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;
    res.send(body);

    // Only log POST, PUT, DELETE requests (skip GET to avoid noise)
    if (req.method !== 'GET' && !req.originalUrl.includes('/api/auth/login')) {
      // Determine category based on URL
      let category = 'system';
      if (req.originalUrl.includes('/customers')) category = 'customer';
      if (req.originalUrl.includes('/campaigns')) category = 'campaign';
      if (req.originalUrl.includes('/segments')) category = 'segment';
      if (req.originalUrl.includes('/workflows')) category = 'workflow';
      if (req.originalUrl.includes('/upload-csv')) category = 'data_import';
      if (req.originalUrl.includes('/insights') || req.originalUrl.includes('/copilot')) category = 'ai';

      // Map HTTP method to an action verb
      const methodMap = {
        POST: 'Created/Triggered',
        PUT: 'Updated',
        DELETE: 'Deleted',
      };
      
      const action = `${methodMap[req.method]} via API (${req.originalUrl.split('?')[0]})`;
      const status = res.statusCode >= 400 ? 'failed' : 'success';

      AuditLog.create({
        action,
        category,
        entity: 'API Route',
        userName: req.user ? req.user.name : 'System',
        userId: req.user ? req.user._id : null,
        status,
        ipAddress: req.ip,
      }).catch(err => console.error('AuditLog auto-logger failed:', err.message));
    }
  };

  next();
};

module.exports = auditLogger;
