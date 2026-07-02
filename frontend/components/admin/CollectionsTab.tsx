"use client";

import React, { useState } from "react";
import { Edit3, Trash2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

interface CollectionsTabProps {
  collections: Collection[];
  onEditCollectionClick: (collection: Collection) => void;
  onNewCollectionClick: () => void;
  onDeleteCollection: (id: string) => void;
}

export function CollectionsTab({
  collections,
  onEditCollectionClick,
  onNewCollectionClick,
  onDeleteCollection
}: CollectionsTabProps) {
  const [search, setSearch] = useState("");

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Action Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        <input
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-xs focus:outline-none rounded-sm bg-transparent w-full sm:max-w-md placeholder-neutral-400"
          aria-label="Search collections"
        />
        <Button onClick={onNewCollectionClick} className="text-xs uppercase tracking-wider font-bold h-9 w-full sm:w-auto">
          Add New Collection
        </Button>
      </div>

      {/* Grid Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCollections.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm sm:col-span-2 md:col-span-3 select-none">
            No seasonal collections match current query specifications.
          </div>
        ) : (
          filteredCollections.map((c) => (
            <div key={c.id} className="bg-white border border-neutral-200 p-6 rounded-sm shadow-2xs flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-3 select-none">
                  <div className="flex items-center gap-2">
                    <FileText className="text-amber-500 fill-amber-500" size={14} />
                    <span className="font-serif text-base font-bold text-neutral-900">{c.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEditCollectionClick(c)}
                      className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                      aria-label={`Edit collection ${c.name}`}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteCollection(c.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                      aria-label={`Delete collection ${c.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-neutral-400 select-none uppercase">Link Identifier: {c.slug}</span>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                    {c.description || "No description provided for this collection."}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-1 text-[9px] text-neutral-400 font-mono select-none">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} />
                  <span>Start: {c.start_date ? new Date(c.start_date).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} />
                  <span>Expiry: {c.end_date ? new Date(c.end_date).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
