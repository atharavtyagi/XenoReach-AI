const express = require('express');
const axios = require('axios');
const router = express.Router();

const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:5000/api/analytics/callback';

/**
 * Simulate realistic delivery timing for a channel
 */
const getChannelProfile = (channel) => {
  const profiles = {
    Email: {
      deliveryRate: 0.88,
      openDelay: [10, 120],    // 10s to 2 min
      readDelay: [30, 300],
      clickDelay: [60, 600],
      convertDelay: [120, 1800],
      openRate: 0.38,
      readRate: 0.65,
      clickRate: 0.28,
      convertRate: 0.15,
      avgRevenue: 1200,
    },
    SMS: {
      deliveryRate: 0.94,
      openDelay: [2, 30],
      readDelay: [5, 60],
      clickDelay: [10, 120],
      convertDelay: [30, 600],
      openRate: 0.62,
      readRate: 0.82,
      clickRate: 0.35,
      convertRate: 0.18,
      avgRevenue: 850,
    },
    WhatsApp: {
      deliveryRate: 0.96,
      openDelay: [3, 60],
      readDelay: [10, 120],
      clickDelay: [20, 300],
      convertDelay: [60, 900],
      openRate: 0.71,
      readRate: 0.88,
      clickRate: 0.42,
      convertRate: 0.22,
      avgRevenue: 1450,
    },
    Push: {
      deliveryRate: 0.82,
      openDelay: [1, 20],
      readDelay: [2, 40],
      clickDelay: [5, 90],
      convertDelay: [20, 360],
      openRate: 0.45,
      readRate: 0.55,
      clickRate: 0.38,
      convertRate: 0.20,
      avgRevenue: 980,
    },
    'Multi-Channel': {
      deliveryRate: 0.91,
      openDelay: [5, 60],
      readDelay: [15, 180],
      clickDelay: [30, 360],
      convertDelay: [60, 1200],
      openRate: 0.55,
      readRate: 0.72,
      clickRate: 0.36,
      convertRate: 0.19,
      avgRevenue: 1300,
    },
  };
  return profiles[channel] || profiles['Email'];
};

/**
 * Send a callback event to the CRM
 */
const sendCallback = async (data) => {
  try {
    await axios.post(CRM_CALLBACK_URL, data, { timeout: 5000 });
  } catch (err) {
    console.error(`⚠️ Callback failed for ${data.communicationId}: ${err.message}`);
  }
};

/**
 * Schedule a delayed event
 */
const scheduleEvent = (fn, minMs, maxMs) => {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  setTimeout(fn, delay * 1000);
};

/**
 * Simulate delivery events for a single communication
 */
const simulateCommunication = (comm, campaignId, channel, crmCallbackUrl) => {
  const profile = getChannelProfile(channel);
  const effectiveCallbackUrl = crmCallbackUrl || CRM_CALLBACK_URL;

  const makeCallback = async (data) => {
    try {
      await axios.post(effectiveCallbackUrl, data, { timeout: 5000 });
    } catch (err) {
      console.error(`Callback err: ${err.message}`);
    }
  };

  // Immediately mark as sent (already done by CRM)
  // Simulate delivery
  const isDelivered = Math.random() < profile.deliveryRate;
  const deliveryDelay = Math.random() * 3 + 0.5; // 0.5s to 3.5s

  setTimeout(async () => {
    if (!isDelivered) {
      await makeCallback({
        communicationId: comm.communicationId,
        campaignId,
        customerId: comm.customerId,
        status: 'failed',
        reason: pick(['Delivery address invalid', 'Network timeout', 'Spam filter blocked', 'Unsubscribed']),
        timestamp: new Date(),
      });
      return;
    }

    // Delivered
    await makeCallback({
      communicationId: comm.communicationId,
      campaignId,
      customerId: comm.customerId,
      status: 'delivered',
      timestamp: new Date(),
    });

    // Opened
    if (Math.random() < profile.openRate) {
      scheduleEvent(async () => {
        await makeCallback({
          communicationId: comm.communicationId,
          campaignId,
          customerId: comm.customerId,
          status: 'opened',
          timestamp: new Date(),
        });

        // Read
        if (Math.random() < profile.readRate) {
          scheduleEvent(async () => {
            await makeCallback({
              communicationId: comm.communicationId,
              campaignId,
              customerId: comm.customerId,
              status: 'read',
              timestamp: new Date(),
            });

            // Clicked
            if (Math.random() < profile.clickRate) {
              scheduleEvent(async () => {
                await makeCallback({
                  communicationId: comm.communicationId,
                  campaignId,
                  customerId: comm.customerId,
                  status: 'clicked',
                  timestamp: new Date(),
                });

                // Converted
                if (Math.random() < profile.convertRate) {
                  scheduleEvent(async () => {
                    const revenue = Math.round(profile.avgRevenue * (0.5 + Math.random()));
                    await makeCallback({
                      communicationId: comm.communicationId,
                      campaignId,
                      customerId: comm.customerId,
                      status: 'converted',
                      revenue,
                      timestamp: new Date(),
                    });
                    console.log(`💰 Conversion! Customer ${comm.customerId} | Revenue: ₹${revenue}`);
                  }, profile.convertDelay[0], profile.convertDelay[1]);
                }
              }, profile.clickDelay[0], profile.clickDelay[1]);
            }
          }, profile.readDelay[0], profile.readDelay[1]);
        }
      }, profile.openDelay[0], profile.openDelay[1]);
    }
  }, deliveryDelay * 1000);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// POST /api/deliver
router.post('/', async (req, res) => {
  try {
    const { campaignId, campaignName, channel, communications, crmCallbackUrl } = req.body;

    if (!campaignId || !communications?.length) {
      return res.status(400).json({ success: false, message: 'campaignId and communications required' });
    }

    console.log(`\n📡 Campaign received: "${campaignName}"`);
    console.log(`   Channel: ${channel} | Recipients: ${communications.length}`);

    // Acknowledge immediately
    res.json({
      success: true,
      message: `Processing ${communications.length} messages via ${channel}`,
      estimated_completion: `${Math.ceil(communications.length * 0.05)}s`,
    });

    // Stagger simulations to be realistic
    communications.forEach((comm, i) => {
      const baseDelay = (i * 50); // 50ms stagger per recipient
      setTimeout(() => {
        simulateCommunication(comm, campaignId, channel, crmCallbackUrl);
      }, baseDelay);
    });

    console.log(`✅ Simulation started for ${communications.length} communications`);
  } catch (err) {
    console.error('Deliver error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
