"use client";

import React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  FolderOpen, 
  Layers, 
  Megaphone, 
  Percent, 
  Truck, 
  Users, 
  MessageSquare, 
  Image, 
  Database, 
  TrendingUp, 
  Mail, 
  Settings, 
  Activity,
  X
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: AdminSidebarProps) {
  const groups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Analytics", icon: TrendingUp },
        { id: "audit", label: "Audit Logs", icon: Activity },
      ]
    },
    {
      title: "Catalog",
      items: [
        { id: "products", label: "Products", icon: ShoppingBag },
        { id: "categories", label: "Categories", icon: Tag },
        { id: "brands", label: "Brands", icon: FolderOpen },
        { id: "collections", label: "Collections", icon: Layers },
        { id: "inventory", label: "Inventory", icon: Database },
        { id: "reviews", label: "Reviews", icon: MessageSquare },
        { id: "lookbook", label: "Lookbook", icon: Image },
      ]
    },
    {
      title: "Operations & Sales",
      items: [
        { id: "orders", label: "Orders", icon: Truck },
        { id: "customers", label: "Customers", icon: Users },
        { id: "coupons", label: "Coupons", icon: Percent },
      ]
    },
    {
      title: "Marketing & Setup",
      items: [
        { id: "campaigns", label: "Campaigns", icon: Megaphone },
        { id: "marketing", label: "Newsletter", icon: Mail },
        { id: "users", label: "Staff Roles", icon: Users },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-800 text-neutral-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin Navigation Sidebar"
      >
        <div className="flex flex-col flex-grow overflow-y-auto py-5 px-4 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800 lg:hidden">
            <span className="font-serif text-lg font-bold tracking-tight text-white">Atelier Panel</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">
                  {group.title}
                </span>
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsOpen(false); // Close sidebar on mobile select
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 select-none ${
                            isActive 
                              ? "bg-amber-500 text-neutral-950 font-bold shadow-sm shadow-amber-500/10" 
                              : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon size={16} className={`shrink-0 ${isActive ? "text-neutral-950" : "text-neutral-500"}`} />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono select-none">
          <p>© 2026 Atelier Enterprise</p>
          <p className="text-neutral-600 mt-1">v1.0.0 (SQLite Active)</p>
        </div>
      </aside>
    </>
  );
}
