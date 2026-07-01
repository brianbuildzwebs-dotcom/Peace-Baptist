import { useEffect } from "react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { churchInfo } from "@/lib/churchInfo";
import { applySplashToDocument, setCachedSplashUrl } from "@/lib/splashImage";

export default function PwaBranding() {
  const { getImage } = useSiteImages();
  const splash = getImage("splash") || churchInfo.images.splash;

  useEffect(() => {
    if (!splash) return;
    setCachedSplashUrl(splash);
    applySplashToDocument(splash);
  }, [splash]);

  return null;
}