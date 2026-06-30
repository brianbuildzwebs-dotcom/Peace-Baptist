import { useEffect } from "react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { churchInfo } from "@/lib/churchInfo";

function upsertLink(rel, href) {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function PwaBranding() {
  const { getImage } = useSiteImages();
  const splash = getImage("splash") || churchInfo.images.splash;

  useEffect(() => {
    if (!splash) return;
    upsertLink("apple-touch-icon", splash);
    upsertLink("apple-touch-startup-image", splash);
  }, [splash]);

  return null;
}