"use client";

import React, { useState } from "react";
import { Edit3, Trash2, ShieldCheck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

interface BrandsTabProps {
  brands: Brand[];
  onEditBrandClick: (brand: Brand) => void;
  onNewBrandClick: () => void;
  onDeleteBrand: (id: string) => void;
}

export function BrandsTab({
  brands,
  onEditBrandClick,
  onNewBrandClick,
  onDeleteBrand
}: BrandsTabProps) {
  const [search, setSearch] = useState("");

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Action bar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        <input
          type="text"
          placeholder="Search brands by identifier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-xs focus:outline-none rounded-sm bg-transparent w-full sm:max-w-md placeholder-neutral-400"
          aria-label="Search brands"
        />
        <Button onClick={onNewBrandClick} className="text-xs uppercase tracking-wider font-bold h-9 w-full sm:w-auto">
          Add New Brand Partner
        </Button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBrands.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm sm:col-span-2 md:col-span-3 select-none">
            No brand partners match current query specifications.
          </div>
        ) : (
          filteredBrands.map((b) => (
            <div key={b.id} className="bg-white border border-neutral-200 p-6 rounded-sm shadow-2xs flex flex-col justify-between group hover:border-neutral-800 transition-all duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-3 select-none">
                  <div className="flex items-center gap-2">
                    <Bookmark className="text-amber-500 fill-amber-500" size={14} />
                    <span className="font-serif text-base font-bold text-neutral-900">{b.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditBrandClick(b)}
                      className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                      aria-label={`Edit brand ${b.name}`}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteBrand(b.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                      aria-label={`Delete brand ${b.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-neutral-400 select-none uppercase">Slug / Link ID: {b.slug}</span>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                    {b.description || "No company profiles description added for this brand partner."}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 font-mono select-none">
                <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-green-600" /> Authorized</span>
                <span>Active Partner</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
