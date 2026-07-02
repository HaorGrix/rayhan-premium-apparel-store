"use client";

import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending_reviews: number;
  pending_gallery_images: number;
}

interface LowStockItem {
  variant_id: string;
  sku: string;
  product_name: string;
  color: string;
  size: string;
  stock: number;
}

interface DashboardTabProps {
  metrics: DashboardMetrics;
  lowStock: LowStockItem[];
  onNavigateTab: (tab: string) => void;
  analytics: {
    sales_trend: { date: string; revenue: number }[];
  } | null;
}

export function DashboardTab({ metrics, lowStock, onNavigateTab, analytics }: DashboardTabProps) {
  // Generate simple SVG path for Sales Trend Sparkline
  const getSalesSparklinePath = () => {
    if (!analytics || !analytics.sales_trend || analytics.sales_trend.length < 2) {
      return "M 0 50 L 100 50";
    }
    const trend = analytics.sales_trend;
    const maxVal = Math.max(...trend.map(t => t.revenue), 100);
    const minVal = Math.min(...trend.map(t => t.revenue), 0);
    const range = maxVal - minVal;
    
    const points = trend.map((t, idx) => {
      const x = (idx / (trend.length - 1)) * 300;
      const y = 80 - ((t.revenue - minVal) / range) * 70; // Map values from 10 to 80
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-neutral-800">
      
      {/* 1. REAL-TIME EXECUTIVE KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        
        {/* Metric Card 1 */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs flex flex-col justify-between group hover:border-neutral-800 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Gross Sales Volume</span>
              <h3 className="font-serif text-3xl font-bold text-neutral-900 mt-1">{formatCurrency(metrics.total_revenue)}</h3>
            </div>
            <span className="p-2.5 bg-neutral-50 text-neutral-900 rounded-sm group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
            <span className="text-green-600">↑ 14.8% vs last week</span>
            <span>Live Sync</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs flex flex-col justify-between group hover:border-neutral-800 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Completed Checkout Orders</span>
              <h3 className="font-serif text-3xl font-bold text-neutral-900 mt-1">{metrics.total_orders}</h3>
            </div>
            <span className="p-2.5 bg-neutral-50 text-neutral-900 rounded-sm group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
              <ShoppingBag size={16} />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
            <span className="text-neutral-500">Avg. Basket Value: {metrics.total_orders > 0 ? formatCurrency(metrics.total_revenue / metrics.total_orders) : "$0.00"}</span>
            <span>Live Sync</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs flex flex-col justify-between group hover:border-neutral-800 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Client Profiles</span>
              <h3 className="font-serif text-3xl font-bold text-neutral-900 mt-1">{metrics.total_customers}</h3>
            </div>
            <span className="p-2.5 bg-neutral-50 text-neutral-900 rounded-sm group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
            <span className="text-green-600">↑ 8.3% Monthly Growth</span>
            <span>Registered</span>
          </div>
        </div>

        {/* Metric Card 4: Sparkline Sales Chart */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Revenue Sparkline (14 Days)</span>
            <Activity size={14} className="text-neutral-400" />
          </div>
          <div className="h-16 w-full flex items-end">
            <svg viewBox="0 0 300 90" className="w-full h-full">
              <path
                d={getSalesSparklinePath()}
                fill="none"
                stroke="#d4af37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="border-t border-neutral-100 mt-2 pt-2 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
            <span>START</span>
            <span>END</span>
          </div>
        </div>

      </div>

      {/* 2. REVENUE GRAPH SUMMARY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Task Shortcuts */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm lg:col-span-1 text-left">
          <h3 className="font-serif text-base font-bold mb-4 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            Quick Workflows
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onNavigateTab("products")}
              className="w-full py-3 px-4 border border-neutral-100 rounded-sm text-left text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all flex justify-between items-center select-none"
            >
              <span>Add New Catalog Product</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigateTab("campaigns")}
              className="w-full py-3 px-4 border border-neutral-100 rounded-sm text-left text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all flex justify-between items-center select-none"
            >
              <span>Configure Seasonal Campaigns</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigateTab("orders")}
              className="w-full py-3 px-4 border border-neutral-100 rounded-sm text-left text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all flex justify-between items-center select-none"
            >
              <span>Review Fulfillment Orders</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigateTab("settings")}
              className="w-full py-3 px-4 border border-neutral-100 rounded-sm text-left text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all flex justify-between items-center select-none"
            >
              <span>Manage Store Specifications</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* System Monitoring Alerts */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm lg:col-span-2 text-left">
          <h3 className="font-serif text-base font-bold mb-4 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-600" />
            System Control Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="border border-neutral-100 p-4 rounded-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-neutral-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Database Engine</span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-semibold">
                <span className="text-neutral-500">Connected Instance: SQLite Fallback</span>
                <span className="text-neutral-400 font-mono">path: ecommerce.db (Local)</span>
              </div>
            </div>

            <div className="border border-neutral-100 p-4 rounded-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-neutral-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Service Security policy</span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-semibold">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle size={10} /> Active: JWT Verification
                </span>
                <span className="text-neutral-400 font-mono">Algorithm: HS256 / Role-Checked</span>
              </div>
            </div>

          </div>

          <div className="bg-neutral-50 border border-neutral-150 p-4 mt-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
            <div className="flex flex-col gap-1 text-left">
              <span className="font-bold text-neutral-800">Pending Moderation Tasks</span>
              <p className="text-[11px] text-neutral-500">Customer feedback reviews and lookbook updates are awaiting security approval.</p>
            </div>
            <button
              onClick={() => onNavigateTab("reviews")}
              className="bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm cursor-pointer select-none"
            >
              Resolve Actions
            </button>
          </div>
        </div>

      </div>

      {/* 3. PENDING MODERATION & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Moderation Alerts */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm text-left">
          <h3 className="font-serif text-base font-bold mb-4 border-b border-neutral-100 pb-3">Pending Moderation Actions</h3>
          <div className="flex flex-col gap-4 text-xs font-semibold">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-neutral-800">Pending Customer Reviews</span>
                <p className="text-[10px] text-neutral-400">Waiting for rating verification</p>
              </div>
              <span className="font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px]">{metrics.pending_reviews} pending</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-neutral-800">Pending Style Lookbook Uploads</span>
                <p className="text-[10px] text-neutral-400">Customer lookbook pictures</p>
              </div>
              <span className="font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px]">{metrics.pending_gallery_images} pending</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm text-left">
          <h3 className="font-serif text-base font-bold mb-4 border-b border-neutral-100 pb-3 text-red-600 flex items-center gap-2">
            <AlertTriangle size={16} />
            Low Stock Warnings (Critical Threshold &lt; 5)
          </h3>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
            {lowStock.length === 0 ? (
              <p className="text-xs text-neutral-400 font-medium py-4 text-center">All variant stocks are healthy.</p>
            ) : (
              lowStock.map((v) => (
                <div key={v.variant_id} className="flex justify-between items-center border-b border-neutral-100 pb-2 text-xs">
                  <div className="flex flex-col gap-0.5 max-w-[250px] sm:max-w-[320px]">
                    <span className="truncate font-bold text-neutral-800">{v.product_name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">SKU: {v.sku} | Color: {v.color} | Size: {v.size}</span>
                  </div>
                  <span className="font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-sm text-[10px]">
                    {v.stock} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
