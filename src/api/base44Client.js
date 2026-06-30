import { createEntityClient } from './entityClient';
import { authClient } from './authClient';

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
      async UploadFile({ file }) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
      },
    },
  },
};