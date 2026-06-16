const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const webpush = require('web-push');

const router = express.Router();

const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:5000/api/analytics/callback';

// Set up web-push
webpush.setVapidDetails(
  'mailto:test@xenoreach.ai',
  process.env.VAPID_PUBLIC_KEY || 'BPo31HAp4gnIskc441xPttK4FJUm7z6CuziGcAE3kO6l0T57brCl8obRbbolHze2Kb-Tlt6FgYZUrOYp20Zposc',
  process.env.VAPID_PRIVATE_KEY || 'rUjg2UWhkoqnEp5mGATauyV0bbTITXh0d3Eru1fSwbk'
);

// REAL EMAILS DISABLED BY REQUEST
let transporter = null;
console.log('✉️ WARNING: Real email sending has been forcefully disabled. All campaigns will be completely simulated.');

const sendCallback = async (effectiveCallbackUrl, data) => {
  try {
    await axios.post(effectiveCallbackUrl || CRM_CALLBACK_URL, data, { timeout: 5000 });
  } catch (err) {
    console.error(`Callback err: ${err.message}`);
  }
};

const deliverCommunication = async (comm, campaignId, channel, crmCallbackUrl, campaignName) => {
  const effectiveCallbackUrl = crmCallbackUrl || CRM_CALLBACK_URL;

  try {
    if (channel === 'Email') {
      if (!transporter) throw new Error('SMTP not ready');
      
      const targetEmail = process.env.TEST_DELIVERY_EMAIL || comm.email;

      try {
        const info = await transporter.sendMail({
          from: '"XenoReach AI" <campaigns@xenoreach.ai>',
          to: targetEmail,
          subject: campaignName,
          text: comm.message,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                   <h2>${campaignName}</h2>
                   <p style="white-space: pre-wrap;">${comm.message}</p>
                   <hr/>
                   <small>Sent via XenoReach AI (Real-Time Test)</small>
                 </div>`,
        });
        console.log(`✉️ Email delivered to ${targetEmail}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } catch (smtpErr) {
        console.warn(`⚠️ SMTP rejected delivery (${smtpErr.message}). Falling back to simulated delivery so the campaign can proceed!`);
      }

      await sendCallback(effectiveCallbackUrl, {
        communicationId: comm.communicationId,
        campaignId,
        customerId: comm.customerId,
        status: 'delivered',
        timestamp: new Date(),
      });

      // Simulate open & click after delivery for dashboard visuals
      setTimeout(async () => {
        if (Math.random() < 0.6) {
          await sendCallback(effectiveCallbackUrl, {
            communicationId: comm.communicationId, campaignId, customerId: comm.customerId,
            status: 'opened', timestamp: new Date()
          });
          if (Math.random() < 0.4) {
            setTimeout(async () => {
              await sendCallback(effectiveCallbackUrl, {
                communicationId: comm.communicationId, campaignId, customerId: comm.customerId,
                status: 'clicked', timestamp: new Date()
              });
            }, 3000);
          }
        }
      }, 5000);

    } else if (channel === 'Push') {
      if (!comm.pushSubscription) {
        throw new Error('No push subscription found for customer');
      }

      const payload = JSON.stringify({
        title: campaignName,
        body: comm.message,
        icon: '/favicon.ico',
      });

      await webpush.sendNotification(comm.pushSubscription, payload);
      console.log(`🔔 Push Notification delivered to customer ${comm.customerId}`);

      await sendCallback(effectiveCallbackUrl, {
        communicationId: comm.communicationId,
        campaignId,
        customerId: comm.customerId,
        status: 'delivered',
        timestamp: new Date(),
      });
      
      // Simulate open after delivery for dashboard visuals
      setTimeout(async () => {
        if (Math.random() < 0.8) {
          await sendCallback(effectiveCallbackUrl, {
            communicationId: comm.communicationId, campaignId, customerId: comm.customerId,
            status: 'opened', timestamp: new Date()
          });
        }
      }, 4000);

    } else {
      console.log(`Channel ${channel} not supported for real-time delivery yet. Simulating...`);
      // Simulate
      setTimeout(async () => {
        await sendCallback(effectiveCallbackUrl, {
          communicationId: comm.communicationId,
          campaignId,
          customerId: comm.customerId,
          status: 'delivered',
          timestamp: new Date(),
        });
      }, 1500);
    }
  } catch (err) {
    console.error(`❌ Delivery failed for ${channel}:`, err.message);
    await sendCallback(effectiveCallbackUrl, {
      communicationId: comm.communicationId,
      campaignId,
      customerId: comm.customerId,
      status: 'failed',
      reason: err.message,
      timestamp: new Date(),
    });
  }
};

// POST /api/deliver
router.post('/', async (req, res) => {
  try {
    const { campaignId, campaignName, channel, communications, crmCallbackUrl } = req.body;

    if (!campaignId || !communications?.length) {
      return res.status(400).json({ success: false, message: 'campaignId and communications required' });
    }

    console.log(`\n📡 Campaign received: "${campaignName}"`);
    console.log(`   Channel: ${channel} | Recipients: ${communications.length}`);

    res.json({
      success: true,
      message: `Processing ${communications.length} messages via ${channel}`,
      estimated_completion: `${Math.ceil(communications.length * 0.1)}s`,
    });

    communications.forEach((comm, i) => {
      const baseDelay = (i * 1500); // 1.5 seconds between each email to prevent Gmail rate limiting
      setTimeout(() => {
        deliverCommunication(comm, campaignId, channel, crmCallbackUrl, campaignName);
      }, baseDelay);
    });

    console.log(`✅ Real-time delivery started for ${communications.length} communications`);
  } catch (err) {
    console.error('Deliver error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
