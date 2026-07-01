import { churchInfo } from '@/lib/churchInfo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const SITE_IMAGE_FIELDS = [
  {
    key: 'splash_screen_image_url',
    label: 'App Splash / Home Screen Icon',
    imageKey: 'splash',
    squarePreview: true,
    hint: 'Upload a square image (512×512 or larger). Shown when the app loads and as the phone home screen icon. After changing this, members may need to remove the old home screen icon and add the app again.',
  },
  { key: 'hero_image_url', label: 'Homepage Hero', imageKey: 'hero' },
  { key: 'welcome_image_url', label: 'Welcome Section', imageKey: 'welcome' },
  { key: 'about_hero_image_url', label: 'About Page Hero', imageKey: 'aboutHero' },
  { key: 'about_sanctuary_image_url', label: 'About — Sanctuary', imageKey: 'aboutSanctuary' },
  { key: 'about_building_image_url', label: 'About — Building', imageKey: 'aboutBuilding' },
  { key: 'worship_image_url', label: 'Worship / Ministries Banner', imageKey: 'worship' },
  { key: 'pastor_image_url', label: 'Pastor Photo', imageKey: 'pastor' },
  { key: 'church_sign_image_url', label: 'Church Sign', imageKey: 'churchSign' },
  { key: 'nursery_image_url', label: 'Nursery', imageKey: 'nursery' },
  { key: 'ministry_sunday_school_image_url', label: 'Ministry — Sunday School', ministryId: 'sunday-school' },
  { key: 'ministry_youth_image_url', label: 'Ministry — Youth', ministryId: 'youth' },
  { key: 'ministry_nursery_image_url', label: 'Ministry — Nursery', ministryId: 'nursery' },
  { key: 'ministry_outreach_image_url', label: 'Ministry — Outreach', ministryId: 'outreach' },
  { key: 'ministry_bus_image_url', label: 'Ministry — Bus', ministryId: 'bus' },
];

const IMAGE_KEY_MAP = Object.fromEntries(
  SITE_IMAGE_FIELDS.filter((f) => f.imageKey).map((f) => [f.imageKey, f.key])
);

const MINISTRY_IMAGE_KEY_MAP = Object.fromEntries(
  SITE_IMAGE_FIELDS.filter((f) => f.ministryId).map((f) => [f.ministryId, f.key])
);

export function useSiteImages() {
  const { get, isLoading } = useSiteSettings();

  const getImage = (imageKey) => {
    const settingKey = IMAGE_KEY_MAP[imageKey];
    const override = settingKey ? get(settingKey) : '';
    return override || churchInfo.images[imageKey] || '';
  };

  const getMinistryImage = (ministryId, fallback = '') => {
    const settingKey = MINISTRY_IMAGE_KEY_MAP[ministryId];
    const override = settingKey ? get(settingKey) : '';
    if (override) return override;
    const ministry = churchInfo.ministries?.find((m) => m.id === ministryId);
    return ministry?.image_url || fallback;
  };

  return { getImage, getMinistryImage, isLoading };
}