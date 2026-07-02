/** Site setting keys safe to expose to anonymous visitors. */
export const PUBLIC_SITE_SETTING_KEYS = new Set([
  'splash_screen_image_url',
  'notification_icon_image_url',
  'hero_image_url',
  'welcome_image_url',
  'about_hero_image_url',
  'about_sanctuary_image_url',
  'about_building_image_url',
  'worship_image_url',
  'pastor_image_url',
  'church_sign_image_url',
  'nursery_image_url',
  'ministry_sunday_school_image_url',
  'ministry_youth_image_url',
  'ministry_nursery_image_url',
  'ministry_outreach_image_url',
  'ministry_bus_image_url',
  'sermon_playlist_url',
  'live_player_embed',
  'live_stream_url',
  'google_maps_embed',
  'facebook_url',
  'youtube_url',
  'instagram_url',
]);

export function filterPublicSiteSettings(rows = []) {
  return rows.filter((row) => row?.key && PUBLIC_SITE_SETTING_KEYS.has(row.key));
}