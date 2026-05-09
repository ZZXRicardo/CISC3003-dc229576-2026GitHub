const express = require('express');
const OpenAI = require('openai');
const { requireLogin } = require('../auth/auth.middleware');

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || 'sk-placeholder',
  baseURL: process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

const MODEL = process.env.QWEN_MODEL || 'qwen-plus';

const SYSTEM_PROMPT = `You are Cornerstone AI, a helpful assistant for CS undergraduates at the University of Macau.

You help students with:
- Master's programme research (programmes data includes name, university, region, tier, duration, tuition, highlight)
- Job / career exploration (jobs data includes title, company, role_type, location, level, highlight)
- My List (a personal shortlist feature on the site)
- General academic and career planning advice

Keep answers concise (2-4 paragraphs), friendly, and actionable. If you don't know something, say so honestly.`;

router.post('/', requireLogin, async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.DASHSCOPE_API_KEY) {
      return res.status(500).json({ error: 'Chat API key is not configured.' });
    }

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: fullMessages
    });

    const reply =
      completion &&
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      typeof completion.choices[0].message.content === 'string'
        ? completion.choices[0].message.content.trim()
        : '';

    if (!reply) {
      return res.status(502).json({ error: 'Chat backend returned an empty reply.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);

    if (err && err.status === 401) {
      return res.status(500).json({ error: 'Chat API key is not configured or invalid.' });
    }

    res.status(500).json({ error: 'Chat service unavailable.' });
  }
});

module.exports = router;
