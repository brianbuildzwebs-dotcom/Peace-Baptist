import { requireAdmin } from '../auth.js';
import { cleanupOrphanedSubmissions } from '../formSubmissions.js';

export async function handleAdminCleanupOrphans(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const result = await cleanupOrphanedSubmissions();
    return res.status(200).json(result);
  } catch (err) {
    console.error('cleanup-orphaned-submissions:', err);
    return res.status(500).json({ error: err.message || 'Cleanup failed' });
  }
}