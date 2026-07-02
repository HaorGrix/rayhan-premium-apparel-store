"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Edit3, Trash2, CheckSquare, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { ImportWizardModal } from "./ImportWizardModal";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  is_active: boolean;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
  collection?: { id: string; name: string };
  specifications?: Record<string, string>;
  seo_metadata?: { title: string; description: string; keywords: string };
  related_product_ids?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  onEditProductClick: (product: Product) => void;
  onNewProductClick: () => void;
  onDeleteProduct: (id: string) => void;
  onRefresh: () => void;
}

export function ProductsTab({
  products,
  categories,
  brands,
  collections,
  onEditProductClick,
  onNewProductClick,
  onDeleteProduct,
  onRefresh
}: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Bulk import wizard state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLogs, setImportLogs] = useState<any[]>([]);

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      const res = await apiFetch<any[]>("/admin/import/history");
      setImportLogs(res);
    } catch (err) {
      console.error("Failed to load import logs", err);
    }
  };
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Filters logic
  const filteredProducts = products.filter(p => {
    const textMatch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const catMatch = !selectedCategory || p.category?.id === selectedCategory;
    const brandMatch = !selectedBrand || p.brand?.id === selectedBrand;
    const collMatch = !selectedCollection || p.collection?.id === selectedCollection;
    const statusMatch = !selectedStatus || (selectedStatus === "active" ? p.is_active : !p.is_active);
    
    return textMatch && catMatch && brandMatch && collMatch && statusMatch;
  });

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map(p => p.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = async (activate: boolean) => {
    setIsBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id => 
          apiFetch(`/admin/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: activate })
          })
        )
      );
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update selected products status.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;
    setIsBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id => apiFetch(`/admin/products/${id}`, { method: "DELETE" }))
      );
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete selected products.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* 1. FILTER CONTROLS TOOLBAR */}
      <div className="bg-white border border-neutral-200 p-6 rounded-sm flex flex-col gap-4 select-none shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Main search bar */}
          <div className="flex items-center gap-3 px-3 py-2 border border-neutral-200 rounded-sm w-full sm:max-w-md focus-within:border-black transition-colors">
            <Search size={16} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Search product name or identifier..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
              aria-label="Search products"
            />
          </div>

          <div className="flex gap-2 ml-auto w-full sm:w-auto">
            <button 
              onClick={() => setShowImportModal(true)}
              className="border border-neutral-800 text-neutral-800 hover:bg-neutral-50 text-xs uppercase tracking-wider font-bold h-10 px-4 flex items-center gap-1.5 transition-colors rounded-sm cursor-pointer shrink-0"
            >
              <Upload size={14} />
              Import Products
            </button>
            <Button onClick={onNewProductClick} className="text-xs uppercase tracking-wider font-bold h-10 w-full sm:w-auto">
              Add Catalog Product
            </Button>
          </div>

        </div>

        {/* Dropdown filters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-200 p-2 text-xs focus:outline-none rounded-sm bg-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-200 p-2 text-xs focus:outline-none rounded-sm bg-transparent"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Collection</label>
            <select
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-200 p-2 text-xs focus:outline-none rounded-sm bg-transparent"
            >
              <option value="">All Collections</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Visibility Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-200 p-2 text-xs focus:outline-none rounded-sm bg-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active (Visible)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

      </div>

      {/* 2. BULK ACTION CONTROLS */}
      {selectedIds.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 text-white p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-xs select-none">
          <div className="font-semibold">
            {selectedIds.length} products selected for batch operations
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              disabled={isBulkLoading}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer"
            >
              Set Visible (Active)
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              disabled={isBulkLoading}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer"
            >
              Set Hidden (Inactive)
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* 3. PRODUCT TABLE LIST */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-4 w-12 text-center">
                  <button 
                    onClick={handleSelectAll} 
                    className="text-neutral-400 hover:text-black transition-colors"
                    aria-label="Select all products"
                  >
                    {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                      <CheckSquare size={16} className="text-black" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 font-medium">
                    No products matching current filter specifications.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isRowSelected = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`hover:bg-neutral-50/50 ${isRowSelected ? "bg-neutral-50/30" : ""}`}>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleSelectRow(p.id)} 
                          className="text-neutral-400 hover:text-black transition-colors"
                          aria-label={`Select product ${p.name}`}
                        >
                          {isRowSelected ? (
                            <CheckSquare size={16} className="text-black" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-neutral-900 block">{p.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{p.slug}</span>
                      </td>
                      <td className="p-4 text-neutral-600 font-medium">{p.category?.name || "N/A"}</td>
                      <td className="p-4 text-neutral-600 font-medium">{p.brand?.name || "N/A"}</td>
                      <td className="p-4 font-bold text-neutral-800">
                        {p.discount_price ? (
                          <div className="flex flex-col">
                            <span className="text-neutral-900">{formatCurrency(p.discount_price)}</span>
                            <span className="line-through text-[10px] text-neutral-400">{formatCurrency(p.price)}</span>
                          </div>
                        ) : (
                          formatCurrency(p.price)
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold border ${
                          p.is_active 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-neutral-100 text-neutral-700 border-neutral-200"
                        }`}>
                          {p.is_active ? "VISIBLE" : "HIDDEN"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onEditProductClick(p)}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                            title="Edit product parameters"
                            aria-label={`Edit product ${p.name}`}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                            title="Soft-delete product from catalog"
                            aria-label={`Delete product ${p.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex justify-between items-center select-none">
            <span className="text-[10px] font-mono text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-sm text-xs font-bold uppercase tracking-wider hover:border-black disabled:opacity-50 disabled:hover:border-neutral-200 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-sm text-xs font-bold uppercase tracking-wider hover:border-black disabled:opacity-50 disabled:hover:border-neutral-200 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import History Logs List */}
      <div className="bg-white border border-border p-6 flex flex-col gap-4 mt-8">
        <div className="flex justify-between items-center border-b border-secondary pb-3">
          <div className="flex flex-col">
            <span className="font-serif text-base font-bold text-neutral-900">Import Logs & Sync History</span>
            <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Auditing batch catalogs updates</span>
          </div>
        </div>

        {importLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 italic">
            No previous imports found in system compliance logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-secondary text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-2">Date & Time</th>
                  <th className="py-2">File Name</th>
                  <th className="py-2">Administrator</th>
                  <th className="py-2">Total Rows</th>
                  <th className="py-2">Success</th>
                  <th className="py-2">Failed</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {importLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 font-mono text-[11px] text-neutral-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-neutral-800">{log.filename}</td>
                    <td className="py-3 text-neutral-600">{log.admin_email}</td>
                    <td className="py-3 font-medium text-neutral-900">{log.products_count}</td>
                    <td className="py-3 text-green-600 font-bold">{log.success_count}</td>
                    <td className="py-3 text-red-600 font-bold">{log.failed_count}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-sm ${
                        log.status === "success" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ImportWizardModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onSuccess={() => {
          onRefresh();
          loadImportHistory();
        }} 
      />
    </div>
  );
}
