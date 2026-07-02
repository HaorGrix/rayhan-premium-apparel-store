"use client";

import React, { useState } from "react";
import { Menu, Search, Bell, LogOut, UserCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  userEmail: string;
  onLogout: () => void;
  onSearchClick: () => void;
  metrics: {
    pending_reviews: number;
    pending_gallery_images: number;
  } | null;
}

export function AdminHeader({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  userEmail,
  onLogout,
  onSearchClick,
  metrics
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const totalNotifications = (metrics?.pending_reviews || 0) + (metrics?.pending_gallery_images || 0);

  const getBreadcrumbs = () => {
    const crumbs = ["Atelier", "Admin"];
    if (activeTab) {
      crumbs.push(activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }
    return crumbs;
  };

  return (
    <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md text-neutral-600 hover:text-black hover:bg-neutral-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-400">
          {getBreadcrumbs().map((crumb, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx === arr.length - 1 ? "text-neutral-900 font-bold" : ""}>
                {crumb}
              </span>
              {idx < arr.length - 1 && <span className="text-neutral-300 font-light font-mono">/</span>}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right section: Search, Notifications & User Settings */}
      <div className="flex items-center gap-4">
        {/* Command Search Shortcut Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-sm hover:border-neutral-400 transition-colors text-neutral-400 text-xs text-left w-36 sm:w-48 cursor-pointer select-none"
          aria-label="Open command search"
        >
          <Search size={14} />
          <span className="flex-grow truncate">Search...</span>
          <kbd className="hidden md:inline-block bg-neutral-100 border px-1 rounded-xs text-[9px] font-mono text-neutral-500">⌘K</kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black relative transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
            aria-label={`View ${totalNotifications} alerts`}
          >
            <Bell size={20} />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-neutral-950 text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 shadow-xl rounded-sm py-2 z-20 text-xs">
                <div className="px-4 py-2 border-b border-neutral-100 font-serif font-bold text-neutral-900 text-sm">
                  System Notifications
                </div>
                {totalNotifications === 0 ? (
                  <div className="px-4 py-6 text-center text-neutral-400 font-medium">
                    No urgent pending tasks.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {metrics && metrics.pending_reviews > 0 && (
                      <div className="px-4 py-3 hover:bg-neutral-50 border-b border-neutral-50 flex flex-col gap-1">
                        <span className="font-bold text-neutral-900">Review Moderation Pending</span>
                        <p className="text-neutral-500 text-[10px]">There are {metrics.pending_reviews} new product reviews waiting for approval.</p>
                      </div>
                    )}
                    {metrics && metrics.pending_gallery_images > 0 && (
                      <div className="px-4 py-3 hover:bg-neutral-50 flex flex-col gap-1">
                        <span className="font-bold text-neutral-900">Lookbook Moderation Pending</span>
                        <p className="text-neutral-500 text-[10px]">There are {metrics.pending_gallery_images} new lookbook photo submissions waiting.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User profile details & Logout */}
        <div className="h-8 w-[1px] bg-neutral-200" />
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <UserCheck size={12} className="text-neutral-400" />
              Alexander M.
            </span>
            <span className="text-[10px] text-neutral-400 truncate max-w-[120px] font-mono">{userEmail}</span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-all select-none"
            title="Log Out"
            aria-label="Log Out of Admin Panel"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
