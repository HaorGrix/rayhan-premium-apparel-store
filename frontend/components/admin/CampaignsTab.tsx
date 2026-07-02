"use client";

import React, { useState } from "react";
import { Megaphone, Edit3, Trash2, Eye, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  desktop_banner_url: string;
  mobile_banner_url: string;
  cta_text?: string;
  cta_link?: string;
  priority: number;
  is_active: boolean;
  badge?: string;
  promotional_copy?: string;
  collection_id?: string | null;
  start_date?: string;
  end_date?: string;
}

interface CampaignsTabProps {
  campaigns: Campaign[];
  onEditCampaignClick: (campaign: Campaign) => void;
  onNewCampaignClick: () => void;
  onDeleteCampaign: (id: string) => void;
  onPreviewCampaign: (campaign: Campaign) => void;
}

export function CampaignsTab({
  campaigns,
  onEditCampaignClick,
  onNewCampaignClick,
  onDeleteCampaign,
  onPreviewCampaign
}: CampaignsTabProps) {
  const [search, setSearch] = useState("");

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Search Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        <input
          type="text"
          placeholder="Search marketing campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-xs focus:outline-none rounded-sm bg-transparent w-full sm:max-w-md placeholder-neutral-400"
          aria-label="Search campaigns"
        />
        <Button onClick={onNewCampaignClick} className="text-xs uppercase tracking-wider font-bold h-9 w-full sm:w-auto">
          Add Marketing Campaign
        </Button>
      </div>

      {/* Campaigns Listing Grid */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-4">Campaign details</th>
                <th className="p-4">Target Link</th>
                <th className="p-4">Priority Rank</th>
                <th className="p-4">Fulfillment Dates</th>
                <th className="p-4">Publish status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-medium">
                    No marketing campaigns configured.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <span className="font-bold text-neutral-900 block flex items-center gap-1.5">
                        <Megaphone size={12} className="text-neutral-400 shrink-0" />
                        {c.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{c.slug}</span>
                    </td>
                    <td className="p-4 font-mono text-neutral-500 font-semibold">{c.cta_link || "/products"}</td>
                    <td className="p-4 font-mono font-bold text-neutral-800 flex items-center gap-1">
                      {c.priority}
                      {c.priority > 5 ? <ArrowUp size={10} className="text-green-600" /> : <ArrowDown size={10} className="text-neutral-400" />}
                    </td>
                    <td className="p-4 text-neutral-500 font-mono font-semibold">
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <span>S: {c.start_date ? new Date(c.start_date).toLocaleDateString() : "Immediate"}</span>
                        <span>E: {c.end_date ? new Date(c.end_date).toLocaleDateString() : "Never Expires"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold border ${
                        c.is_active 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-neutral-100 text-neutral-700 border-neutral-200"
                      }`}>
                        {c.is_active ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onPreviewCampaign(c)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                          title="Preview banner editorial aspect"
                          aria-label={`Preview campaign ${c.name}`}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onEditCampaignClick(c)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                          title="Edit campaign settings"
                          aria-label={`Edit campaign ${c.name}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteCampaign(c.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                          title="Delete campaign"
                          aria-label={`Delete campaign ${c.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
