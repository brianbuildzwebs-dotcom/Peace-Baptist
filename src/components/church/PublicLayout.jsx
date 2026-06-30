import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { handleGetAppClick } from "@/lib/pwaInstall";
import TopBar from "./TopBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PwaInstallBanner from "./PwaInstallBanner";
import InstallAppModal from "./InstallAppModal";
import NotificationPrompt from "./NotificationPrompt";

export default function PublicLayout() {
  const [installOpen, setInstallOpen] = useState(false);

  const openInstall = () => setInstallOpen(true);

  const handleGetApp = () => {
    handleGetAppClick({ onShowInstructions: openInstall });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <PwaInstallBanner onOpenInstall={openInstall} />
        <TopBar onOpenInstall={handleGetApp} />
        <SiteHeader onOpenInstall={handleGetApp} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter onOpenInstall={handleGetApp} />
      <NotificationPrompt />
      <InstallAppModal open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}