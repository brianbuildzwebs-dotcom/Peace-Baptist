import { getSupabaseAdmin } from './supabase.js';
import {
  easternDateString,
  isDevotionPubliclyVisible,
  isPublishTimeReached,
} from './churchTime.js';

export { isDevotionPubliclyVisible, isPublishTimeReached } from './churchTime.js';

export function filterPublicDevotions(rows = [], now = new Date()) {
  return rows.filter((row) => isDevotionPubliclyVisible(row, now));
}

export async function promoteDueDevotions(now = new Date()) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { promoted: 0 };

  const { data, error } = await supabase
    .from('daily_devotions')
    .select('*')
    .eq('status', 'scheduled');

  if (error) throw error;

  const due = (data || []).filter((row) => isPublishTimeReached(row, now));
  if (!due.length) return { promoted: 0 };

  const ids = due.map((row) => row.id);
  const { error: updateError } = await supabase
    .from('daily_devotions')
    .update({ status: 'published' })
    .in('id', ids);

  if (updateError) throw updateError;
  return { promoted: due.length };
}

export async function getPublishedDevotionForDate(date = easternDateString()) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await promoteDueDevotions();

  const { data, error } = await supabase
    .from('daily_devotions')
    .select('*')
    .eq('devotion_date', date);

  if (error) throw error;
  const visible = filterPublicDevotions(data || []);
  return visible[0] || null;
}