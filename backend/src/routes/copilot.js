const express = require('express');
const { authenticate } = require('../middleware/auth');
const { copilotChat } = require('../services/gemini');

const router = express.Router();
router.use(authenticate);

// In-memory conversation store (replace with Redis/DB in production)
const conversations = new Map();

// POST /api/copilot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const sid = sessionId || req.user._id.toString();
    const history = conversations.get(sid) || [];

    const { response, actions, history: newHistory } = await copilotChat(message, history);

    conversations.set(sid, newHistory);

    res.json({ success: true, response, actions, sessionId: sid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/copilot/session/:sessionId — clear conversation
router.delete('/session/:sessionId', authenticate, (req, res) => {
  conversations.delete(req.params.sessionId);
  res.json({ success: true, message: 'Session cleared' });
});

module.exports = router;
