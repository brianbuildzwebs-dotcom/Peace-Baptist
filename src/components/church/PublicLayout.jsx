import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PwaInstallBanner from "./PwaInstallBanner";
import InstallAppModal from "./InstallAppModal";
import NotificationPrompt from "./NotificationPrompt";

export default function PublicLayout() {
  const [installOpen, setInstallOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <PwaInstallBanner onOpenInstall={() => setInstallOpen(true)} />
        <TopBar onOpenInstall={() => setInstallOpen(true)} />
        <SiteHeader onOpenInstall={() => setInstallOpen(true)} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter onOpenInstall={() => setInstallOpen(true)} />
      <NotificationPrompt />
      <InstallAppModal open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}