import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageSeo, getSeoForPath } from '@/lib/seo';
import { trackPageView } from '@/lib/analytics';

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyPageSeo(getSeoForPath(pathname));
    trackPageView(pathname);
  }, [pathname]);

  return null;
}