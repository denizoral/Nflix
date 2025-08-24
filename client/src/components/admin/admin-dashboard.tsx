import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { OverviewSection } from "./overview-section";
import { MoviesSection } from "./movies-section";
import { UploadSection } from "./upload-section";
import { DownloaderSection } from "./downloader-section";
import { AnalyticsSection } from "./analytics-section";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;
      case "movies":
        return <MoviesSection />;
      case "upload":
        return <UploadSection />;
      case "downloader":
        return <DownloaderSection />;
      case "analytics":
        return <AnalyticsSection />;
      default:
        return <OverviewSection />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto"
      data-testid="admin-dashboard"
    >
      <div className="min-h-screen">
        {/* Admin Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">DotByte Admin Dashboard</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              data-testid="close-admin-btn"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onClose={onClose}
          />

          {/* Main Content */}
          <main className="flex-1 p-6" data-testid="admin-main-content">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
}
