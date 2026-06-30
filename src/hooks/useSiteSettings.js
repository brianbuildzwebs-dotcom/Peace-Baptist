import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSiteSettings() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => base44.entities.SiteSettings.list().catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  const settings = {};
  rows.forEach((row) => {
    if (row?.key) settings[row.key] = row.value || '';
  });

  const get = (key, fallback = '') => settings[key] || fallback;

  return { settings, isLoading, get };
}