import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PwaInstallBanner from "./PwaInstallBanner";
import NotificationPrompt from "./NotificationPrompt";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <PwaInstallBanner />
        <TopBar />
        <SiteHeader />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <NotificationPrompt />
    </div>
  );
}