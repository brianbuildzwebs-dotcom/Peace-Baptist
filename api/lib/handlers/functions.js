import { sendNotification } from '../email.js';

export async function handleFunction(req, res, name) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (name === 'notifyNewPrayer' && req.body) {
    await sendNotification('prayer', req.body);
  }

  return res.status(200).json({ success: true, function: name });
}