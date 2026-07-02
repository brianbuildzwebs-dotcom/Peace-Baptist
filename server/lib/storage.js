export const UPLOAD_BUCKET = 'site-uploads';

/** Extract object path from a Supabase public storage URL for site-uploads bucket. */
export function storageObjectPathFromPublicUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    const prefix = `/storage/v1/object/public/${UPLOAD_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(parsed.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

export async function deleteStorageObjectByPublicUrl(supabase, url) {
  const path = storageObjectPathFromPublicUrl(url);
  if (!path || !supabase) return { deleted: false };

  const { error } = await supabase.storage.from(UPLOAD_BUCKET).remove([path]);
  if (error) {
    console.warn('Storage delete failed:', path, error.message);
    return { deleted: false, error: error.message };
  }
  return { deleted: true, path };
}