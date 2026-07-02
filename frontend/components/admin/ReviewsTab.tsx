"use client";

import React, { useState } from "react";
import { MessageSquare, Check, X, Star, AlertCircle } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  status: string;
  is_verified_purchase: boolean;
  created_at: string;
  product?: { name: string };
  user?: { email: string };
}

interface ReviewsTabProps {
  reviews: Review[];
  onModerateReview: (id: string, action: string) => void;
}

export function ReviewsTab({ reviews, onModerateReview }: ReviewsTabProps) {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredReviews = reviews.filter(r => 
    selectedStatus === "all" || r.status.toLowerCase() === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Filtering Tab buttons */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex items-center justify-between select-none shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["all", "pending", "approved", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border select-none transition-all cursor-pointer ${
                selectedStatus === status
                  ? "bg-black border-black text-white"
                  : "bg-transparent border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">
          Total: {filteredReviews.length} reviews
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm md:col-span-2 select-none">
            No product reviews match current validation status.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div key={r.id} className="bg-white border border-neutral-200 p-6 rounded-sm shadow-2xs flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="flex flex-col gap-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-neutral-100 pb-3 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-neutral-900 truncate max-w-[200px]">{r.product?.name || "Catalog Product"}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">By: {r.user?.email || "Anonymous"}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold border ${getStatusBadge(r.status)}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>

                {/* Rating & Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 select-none">
                    <div className="flex gap-0.5 text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={12} 
                          className={idx < r.rating ? "fill-amber-500 text-amber-500" : "text-neutral-200"} 
                        />
                      ))}
                    </div>
                    {r.is_verified_purchase && (
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.2 border border-green-100 rounded-sm">
                        VERIFIED BUYER
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-xs text-neutral-900 block">{r.title || "No Title Specified"}</span>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                    "{r.content || "No review content description was entered by the client."}"
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 font-mono select-none">
                <span>Logged: {new Date(r.created_at).toLocaleDateString()}</span>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onModerateReview(r.id, "approve")}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-sm font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                    >
                      <Check size={10} /> Approve
                    </button>
                    <button
                      onClick={() => onModerateReview(r.id, "reject")}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-sm font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                    >
                      <X size={10} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
