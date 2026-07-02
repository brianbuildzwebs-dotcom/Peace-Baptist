import { getSupabaseAdmin } from './supabase.js';

const DEFAULT_FORM_PREFIX = 'default_';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPersistedFormId(formId) {
  if (!formId) return false;
  if (String(formId).startsWith(DEFAULT_FORM_PREFIX)) return true;
  return UUID_RE.test(String(formId));
}

export async function getActiveCustomFormIds() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Set();

  const { data, error } = await supabase.from('custom_forms').select('id');
  if (error) throw error;
  return new Set((data || []).map((row) => row.id));
}

export async function getActiveEventIds() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Set();

  const { data, error } = await supabase.from('events').select('id');
  if (error) throw error;
  return new Set((data || []).map((row) => row.id));
}

export function isCustomFormSubmission(submission, activeFormIds) {
  const formId = submission?.form_id;
  if (!formId || String(formId).startsWith(DEFAULT_FORM_PREFIX)) return false;
  if (!UUID_RE.test(String(formId))) return false;
  return activeFormIds.has(formId);
}

export function isEventRegistrationSubmission(submission) {
  const formId = String(submission?.form_id || '');
  return formId.startsWith(DEFAULT_FORM_PREFIX) || Boolean(submission?.event_id);
}

export function isOrphanedSubmission(submission, activeFormIds, activeEventIds = new Set()) {
  const formId = submission?.form_id;
  if (!formId) return true;

  if (String(formId).startsWith(DEFAULT_FORM_PREFIX)) {
    const eventId = submission?.event_id;
    return Boolean(eventId) && !activeEventIds.has(eventId);
  }

  if (!UUID_RE.test(String(formId))) return false;
  return !activeFormIds.has(formId);
}

export function filterValidSubmissions(submissions = [], activeFormIds, activeEventIds = new Set()) {
  return submissions.filter((row) => !isOrphanedSubmission(row, activeFormIds, activeEventIds));
}

export function filterCustomFormSubmissions(submissions = [], activeFormIds) {
  return submissions.filter((row) => isCustomFormSubmission(row, activeFormIds));
}

export async function deleteSubmissionsForForm(formId) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !formId) return { deleted: 0 };

  const { data, error } = await supabase
    .from('form_submissions')
    .delete()
    .eq('form_id', formId)
    .select('id');

  if (error) throw error;
  return { deleted: data?.length || 0 };
}

export async function deleteSubmissionsForEvent(eventId) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !eventId) return { deleted: 0 };

  const { data, error } = await supabase
    .from('form_submissions')
    .delete()
    .eq('event_id', eventId)
    .select('id');

  if (error) throw error;
  return { deleted: data?.length || 0 };
}

export async function cleanupOrphanedSubmissions() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { deleted: 0 };

  const [activeFormIds, activeEventIds] = await Promise.all([
    getActiveCustomFormIds(),
    getActiveEventIds(),
  ]);
  const { data, error } = await supabase.from('form_submissions').select('id, form_id, event_id');
  if (error) throw error;

  const orphanIds = (data || [])
    .filter((row) => isOrphanedSubmission(row, activeFormIds, activeEventIds))
    .map((row) => row.id);

  if (!orphanIds.length) return { deleted: 0 };

  const { error: deleteError } = await supabase.from('form_submissions').delete().in('id', orphanIds);
  if (deleteError) throw deleteError;
  return { deleted: orphanIds.length };
}