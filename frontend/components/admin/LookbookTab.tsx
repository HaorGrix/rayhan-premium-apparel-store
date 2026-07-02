"use client";

import React, { useState } from "react";
import { Image, Check, X, ShieldAlert } from "lucide-react";

interface GalleryImage {
  id: string;
  product_id: string;
  image_url: string;
  caption?: string;
  status: string;
  created_at: string;
}

interface LookbookTabProps {
  galleryImages: GalleryImage[];
  onModerateGallery: (id: string, action: string) => void;
}

export function LookbookTab({ galleryImages, onModerateGallery }: LookbookTabProps) {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredImages = galleryImages.filter(img => 
    selectedStatus === "all" || img.status.toLowerCase() === selectedStatus
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
          Total: {filteredImages.length} images
        </div>
      </div>

      {/* Lookbooks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm sm:col-span-2 md:col-span-3 lg:col-span-4 select-none">
            No lookbook gallery images match current validation status.
          </div>
        ) : (
          filteredImages.map((img) => (
            <div key={img.id} className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-neutral-800 transition-all duration-300">
              
              {/* Image Aspect ratio container */}
              <div className="w-full aspect-[4/5] bg-neutral-100 overflow-hidden relative select-none">
                <img 
                  src={img.image_url} 
                  alt="Customer lookbook" 
                  loading="lazy" 
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500" 
                />
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-sm text-[8px] font-bold border ${getStatusBadge(img.status)}`}>
                  {img.status.toUpperCase()}
                </span>
              </div>

              {/* Caption & Info */}
              <div className="p-4 flex flex-col gap-3 flex-grow justify-between">
                <p className="text-xs text-neutral-600 leading-relaxed font-medium italic">
                  "{img.caption || "No customer caption added."}"
                </p>

                <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2 text-[9px] text-neutral-400 font-mono">
                  <span>Uploaded: {new Date(img.created_at).toLocaleDateString()}</span>
                  
                  {img.status === "pending" && (
                    <div className="flex gap-1.5 mt-1">
                      <button
                        onClick={() => onModerateGallery(img.id, "approve")}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-sm font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                      >
                        <Check size={10} /> Approve
                      </button>
                      <button
                        onClick={() => onModerateGallery(img.id, "reject")}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-sm font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                      >
                        <X size={10} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
