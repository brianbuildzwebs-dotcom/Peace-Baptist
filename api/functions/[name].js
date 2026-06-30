import { sendNotification } from '../lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (name === 'notifyNewPrayer' && req.body) {
    await sendNotification('prayer', req.body);
  }

  return res.status(200).json({ success: true, function: name });
}