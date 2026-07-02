"use client";

import React, { useState } from "react";
import { Edit3, Trash2, Folder, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

interface CategoriesTabProps {
  categories: Category[];
  onEditCategoryClick: (category: Category) => void;
  onNewCategoryClick: () => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoriesTab({
  categories,
  onEditCategoryClick,
  onNewCategoryClick,
  onDeleteCategory
}: CategoriesTabProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Group parent vs subcategories
  const parentCategories = filteredCategories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId);

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Search and Action Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-xs focus:outline-none rounded-sm bg-transparent w-full sm:max-w-md placeholder-neutral-400"
          aria-label="Search categories"
        />
        <Button onClick={onNewCategoryClick} className="text-xs uppercase tracking-wider font-bold h-9 w-full sm:w-auto">
          Add New Category
        </Button>
      </div>

      {/* Category Tree Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parentCategories.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm md:col-span-2 select-none">
            No categories match current query specifications.
          </div>
        ) : (
          parentCategories.map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <div key={parent.id} className="bg-white border border-neutral-200 p-6 rounded-sm shadow-2xs flex flex-col justify-between">
                <div>
                  {/* Parent Title */}
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4 select-none">
                    <div className="flex items-center gap-2">
                      <Folder className="text-amber-500 fill-amber-500" size={16} />
                      <span className="font-serif text-base font-bold text-neutral-900">{parent.name}</span>
                      <span className="text-[9px] font-mono text-neutral-400">/{parent.slug}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onEditCategoryClick(parent)}
                        className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-150 rounded-sm transition-colors cursor-pointer"
                        aria-label={`Edit category ${parent.name}`}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(parent.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                        aria-label={`Delete category ${parent.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 italic mb-4 font-medium select-none">
                    {parent.description || "No category description specified."}
                  </p>

                  {/* Subcategories list */}
                  {subs.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1 select-none">Subcategories</span>
                      <div className="flex flex-col gap-1">
                        {subs.map((sub) => (
                          <div key={sub.id} className="flex justify-between items-center bg-neutral-50 p-2 border border-neutral-100 rounded-sm">
                            <div className="flex items-center gap-1.5 select-none">
                              <LayoutGrid size={11} className="text-neutral-400" />
                              <span className="font-bold text-neutral-800 text-xs">{sub.name}</span>
                              <span className="text-[9px] font-mono text-neutral-400">/{sub.slug}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => onEditCategoryClick(sub)}
                                className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-150 rounded-sm transition-colors cursor-pointer"
                                aria-label={`Edit subcategory ${sub.name}`}
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(sub.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                                aria-label={`Delete subcategory ${sub.name}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
