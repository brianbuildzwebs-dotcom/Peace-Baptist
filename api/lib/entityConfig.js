export const ENTITY_CONFIG = {
  Event: {
    table: 'events',
    publicRead: true,
    publicCreate: false,
  },
  Ministry: {
    table: 'ministries',
    publicRead: true,
    publicCreate: false,
  },
  Testimonial: {
    table: 'testimonials',
    publicRead: true,
    publicCreate: false,
  },
  MediaItem: {
    table: 'media_items',
    publicRead: true,
    publicCreate: false,
  },
  SiteSettings: {
    table: 'site_settings',
    publicRead: true,
    publicCreate: false,
  },
  ContactMessage: {
    table: 'contact_messages',
    publicRead: false,
    publicCreate: true,
    notify: 'contact',
  },
  PrayerRequest: {
    table: 'prayer_requests',
    publicRead: true,
    publicCreate: true,
    notify: 'prayer',
  },
  DailyDevotion: {
    table: 'daily_devotions',
    publicRead: true,
    publicCreate: false,
  },
  CustomForm: {
    table: 'custom_forms',
    publicRead: false,
    publicCreate: false,
  },
  FormSubmission: {
    table: 'form_submissions',
    publicRead: false,
    publicCreate: true,
    notify: 'form',
  },
  GivingRecord: {
    table: 'giving_records',
    publicRead: false,
    publicCreate: true,
  },
  LiveChat: {
    table: null,
    publicRead: false,
    publicCreate: true,
  },
  BlogPost: {
    table: null,
    publicRead: true,
    publicCreate: false,
  },
};

export function getEntityConfig(entity) {
  return ENTITY_CONFIG[entity] || null;
}