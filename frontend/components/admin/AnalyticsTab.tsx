"use client";

import React, { useState } from "react";
import { Download, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CategorySales {
  category: string;
  sales: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
}

interface AnalyticsData {
  category_sales: CategorySales[];
  sales_trend: SalesTrend[];
}

interface AnalyticsTabProps {
  analytics: AnalyticsData;
}

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  const [filterDays, setFilterDays] = useState<number>(30); // Mock filter range

  // Filter trend data
  const filteredTrend = analytics.sales_trend.slice(-filterDays);
  
  // Calculate average order value
  const totalRevenue = filteredTrend.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailyRevenue = filteredTrend.length > 0 ? totalRevenue / filteredTrend.length : 0;

  // Generate SVG graph coordinates
  const getGraphPoints = () => {
    if (filteredTrend.length < 2) return "";
    const maxVal = Math.max(...filteredTrend.map(t => t.revenue), 100);
    const minVal = Math.min(...filteredTrend.map(t => t.revenue), 0);
    const range = maxVal - minVal;
    
    return filteredTrend.map((t, idx) => {
      const x = (idx / (filteredTrend.length - 1)) * 500;
      const y = 220 - ((t.revenue - minVal) / range) * 180; // Scale to fit 250px height SVG
      return `${x},${y}`;
    }).join(" ");
  };

  // Client-side CSV export trigger
  const handleExportCSV = (type: "trend" | "category") => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === "trend") {
      csvContent += "Date,Revenue (USD)\n";
      filteredTrend.forEach(t => {
        csvContent += `${t.date},${t.revenue.toFixed(2)}\n`;
      });
    } else {
      csvContent += "Category Name,Sales Volume (USD)\n";
      analytics.category_sales.forEach(c => {
        csvContent += `"${c.category}",${c.sales.toFixed(2)}\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `atelier_analytics_${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-neutral-800 text-left">
      
      {/* Filters Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-neutral-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Report Range</span>
          <select 
            value={filterDays} 
            onChange={(e) => setFilterDays(Number(e.target.value))}
            className="border border-neutral-200 px-3 py-1 text-xs focus:outline-none rounded-sm bg-transparent"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExportCSV("trend")}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:border-black rounded-sm text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-all cursor-pointer select-none"
          >
            <Download size={12} />
            Export Sales CSV
          </button>
          <button
            onClick={() => handleExportCSV("category")}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:border-black rounded-sm text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-all cursor-pointer select-none"
          >
            <Download size={12} />
            Export Category CSV
          </button>
        </div>
      </div>

      {/* Analytics KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
        <div className="border border-neutral-200 p-6 rounded-sm bg-white shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign size={12} /> Total Revenue for Selected Period
          </span>
          <p className="font-serif text-3xl font-bold text-neutral-900 mt-2">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="border border-neutral-200 p-6 rounded-sm bg-white shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} /> Average Daily Revenue Volume
          </span>
          <p className="font-serif text-3xl font-bold text-neutral-900 mt-2">{formatCurrency(avgDailyRevenue)}</p>
        </div>
      </div>

      {/* SVG Line Chart for Revenue Trends */}
      <div className="bg-white border border-neutral-200 p-6 rounded-sm">
        <h3 className="font-serif text-base font-bold mb-6">Revenue Trend Visualization</h3>
        
        {filteredTrend.length >= 2 ? (
          <div className="h-64 w-full">
            <svg viewBox="0 0 500 250" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="220" x2="500" y2="220" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4" />
              
              {/* Graph Line */}
              <polyline
                fill="none"
                stroke="#d4af37"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getGraphPoints()}
              />
            </svg>
            <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono mt-2 select-none">
              <span>{filteredTrend[0]?.date}</span>
              <span>{filteredTrend[filteredTrend.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-neutral-400 font-medium text-xs">
            Insufficient trend details available.
          </div>
        )}
      </div>

      {/* Category breakdown table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales by Category table */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm">
          <h3 className="font-serif text-base font-bold mb-4">Sales by Bounded Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-none">
              <thead>
                <tr className="bg-neutral-50 border-b font-semibold text-neutral-700">
                  <th className="p-3">Category Name</th>
                  <th className="p-3 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.category_sales.map((c, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800">{c.category}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">{formatCurrency(c.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Revenue Trends Detail Table */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm">
          <h3 className="font-serif text-base font-bold mb-4">Daily Sales Log</h3>
          <div className="overflow-y-auto max-h-60 pr-2 scrollbar-thin">
            <table className="w-full text-xs text-left border-collapse select-none">
              <thead>
                <tr className="bg-neutral-50 border-b font-semibold text-neutral-700 sticky top-0 bg-white">
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTrend.slice().reverse().map((t, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-600">{t.date}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">{formatCurrency(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
