import { cleanupOrphanedSubmissions } from '../server/lib/formSubmissions.js';

const result = await cleanupOrphanedSubmissions();
console.log(`Removed ${result.deleted} orphaned form submission(s).`);