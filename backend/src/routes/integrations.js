const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Simulated integration statuses
const integrations = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync orders and customers from your Shopify store',
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recordsSynced: 1247,
    icon: 'shopify',
    category: 'eCommerce',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Import data from your WooCommerce store',
    status: 'disconnected',
    lastSync: null,
    recordsSynced: 0,
    icon: 'woo',
    category: 'eCommerce',
  },
  {
    id: 'pos',
    name: 'POS System',
    description: 'Connect to your Point of Sale system',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    recordsSynced: 892,
    icon: 'pos',
    category: 'Retail',
  },
  {
    id: 'erp',
    name: 'SAP ERP',
    description: 'Sync customer and transaction data from SAP',
    status: 'pending',
    lastSync: null,
    recordsSynced: 0,
    icon: 'sap',
    category: 'Enterprise',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync email lists and campaign data',
    status: 'connected',
    lastSync: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    recordsSynced: 2103,
    icon: 'mailchimp',
    category: 'Marketing',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send WhatsApp campaigns to customers',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    recordsSynced: 456,
    icon: 'whatsapp',
    category: 'Messaging',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Sync payment and transaction data',
    status: 'disconnected',
    lastSync: null,
    recordsSynced: 0,
    icon: 'razorpay',
    category: 'Payments',
  },
  {
    id: 'googleanalytics',
    name: 'Google Analytics',
    description: 'Import website behavior and conversion data',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    recordsSynced: 5672,
    icon: 'ga',
    category: 'Analytics',
  },
];

// GET /api/integrations
router.get('/', (req, res) => {
  res.json({ success: true, data: integrations });
});

// POST /api/integrations/:id/connect — simulate connection
router.post('/:id/connect', (req, res) => {
  const integration = integrations.find(i => i.id === req.params.id);
  if (!integration) return res.status(404).json({ success: false, message: 'Integration not found' });

  integration.status = 'connected';
  integration.lastSync = new Date().toISOString();
  integration.recordsSynced = Math.floor(Math.random() * 5000) + 100;

  res.json({ success: true, data: integration, message: `${integration.name} connected successfully` });
});

// POST /api/integrations/:id/disconnect
router.post('/:id/disconnect', (req, res) => {
  const integration = integrations.find(i => i.id === req.params.id);
  if (!integration) return res.status(404).json({ success: false, message: 'Integration not found' });

  integration.status = 'disconnected';
  integration.lastSync = null;
  res.json({ success: true, data: integration, message: `${integration.name} disconnected` });
});

// POST /api/integrations/:id/sync — trigger sync
router.post('/:id/sync', (req, res) => {
  const integration = integrations.find(i => i.id === req.params.id);
  if (!integration) return res.status(404).json({ success: false, message: 'Integration not found' });
  if (integration.status !== 'connected') {
    return res.status(400).json({ success: false, message: 'Integration not connected' });
  }

  integration.lastSync = new Date().toISOString();
  integration.recordsSynced += Math.floor(Math.random() * 100);
  res.json({ success: true, message: `Sync triggered for ${integration.name}`, synced: integration.recordsSynced });
});

module.exports = router;
