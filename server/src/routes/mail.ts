import express from 'express';
import { tokenStore } from '../lib/store';
import { gmailConnector } from '../services/gmail';

export const mailRouter = express.Router();

// List messages
mailRouter.get('/messages', async (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  const label = (req.query.label as string) || 'INBOX';
  const token = tokenStore.get(userId);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const items = await gmailConnector.listMessages(token.accessToken, label);
    res.json({ items });
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.error?.message || err?.message || 'Failed to list messages';
    res.status(500).json({ error: msg });
  }
});

// Message detail
mailRouter.get('/messages/:id', async (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  const token = tokenStore.get(userId);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const item = await gmailConnector.getMessage(token.accessToken, req.params.id);
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

// Send message
mailRouter.post('/send', async (req, res) => {
  const userId = req.body?.userId || 'demo-user';
  const token = tokenStore.get(userId);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { to, subject, body } = req.body;
    await gmailConnector.sendMessage(token.accessToken, { to, subject, body });
    res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.error?.message || err?.message || 'Failed to send message';
    res.status(500).json({ error: msg });
  }
});