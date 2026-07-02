import { createEntityClient } from './entityClient';
import { authClient } from './authClient';
import { getPeaceAccessToken } from '@/lib/auth-session';
import { notifyAdminMfaRequired } from '@/lib/mfa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Drop-in replacement for the Base44 SDK client.
 * Keeps the same `base44.entities.*` / `base44.auth.*` shape so pages don't need rewrites.
 */
export const base44 = {
  entities: {
    Event: createEntityClient('Event'),

    PrayerRequest: createEntityClient('PrayerRequest'),
    DailyDevotion: createEntityClient('DailyDevotion'),
    MediaItem: createEntityClient('MediaItem'),
    Ministry: createEntityClient('Ministry'),
    ContactMessage: createEntityClient('ContactMessage'),
    GivingRecord: createEntityClient('GivingRecord'),
    SiteSettings: createEntityClient('SiteSettings'),
    CustomForm: createEntityClient('CustomForm'),
    FormSubmission: createEntityClient('FormSubmission'),
    Testimonial: createEntityClient('Testimonial'),
    LiveChat: createEntityClient('LiveChat'),
    User: createEntityClient('User'),
  },

  auth: authClient,

  functions: {
    async invoke(name, data) {
      const response = await fetch(`${API_BASE}/functions/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Function ${name} failed`);
      return response.json();
    },
  },

  integrations: {
    Core: {
      async UploadFile({ file, replaceUrl } = {}) {
        const token = await getPeaceAccessToken();
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'image/jpeg',
            data: btoa(binary),
            ...(replaceUrl ? { replace_url: replaceUrl } : {}),
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload.code === 'mfa_required') {
            notifyAdminMfaRequired();
          }
          throw new Error(payload.error || payload.message || 'Upload failed');
        }
        return payload;
      },
    },
  },
};