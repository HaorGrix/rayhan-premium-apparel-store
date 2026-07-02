"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, Edit, Save, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
}

interface InventoryTabProps {
  inventory: InventoryItem[];
  onRefresh: () => void;
}

export function InventoryTab({ inventory, onRefresh }: InventoryTabProps) {
  const [search, setSearch] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStock, setEditedStock] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Filters logic
  const filteredItems = inventory.filter(item => {
    const textMatch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                      item.sku.toLowerCase().includes(search.toLowerCase()) || 
                      item.color.toLowerCase().includes(search.toLowerCase());
                      
    const lowStockMatch = !onlyLowStock || item.stock < 5;
    
    return textMatch && lowStockMatch;
  });

  const handleStockChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setEditedStock(prev => ({ ...prev, [id]: parsed }));
    }
  };

  const handleStartEditing = () => {
    // Initialize temporary stock editing values
    const initial: Record<string, number> = {};
    inventory.forEach(item => {
      initial[item.id] = item.stock;
    });
    setEditedStock(initial);
    setIsEditing(true);
  };

  const handleSaveBatch = async () => {
    setIsSaving(true);
    try {
      // Find what modified
      const modifiedIds = Object.keys(editedStock).filter(
        id => editedStock[id] !== inventory.find(item => item.id === id)?.stock
      );

      await Promise.all(
        modifiedIds.map(id =>
          apiFetch(`/admin/inventory/${id}?stock=${editedStock[id]}`, {
            method: "PATCH"
          })
        )
      );
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update batch inventory levels.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* 1. FILTER CONTROLS TOOLBAR */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        
        {/* Search */}
        <div className="flex items-center gap-3 px-3 py-2 border border-neutral-200 rounded-sm w-full sm:max-w-md focus-within:border-black transition-colors">
          <Search size={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search SKU, product name, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
            aria-label="Search inventory"
          />
        </div>

        {/* Low Stock toggle & Action buttons */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-neutral-600 hover:text-black transition-colors">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded-sm border-neutral-300 focus:ring-neutral-950 focus:outline-none w-4 h-4"
            />
            <span className="flex items-center gap-1.5 text-red-600">
              <ShieldAlert size={14} /> Critical Stock (&lt; 5) Only
            </span>
          </label>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSaveBatch} 
                  isLoading={isSaving}
                  className="text-xs uppercase tracking-wider font-bold h-9 px-4"
                >
                  <Save size={14} className="mr-1.5" /> Save Batch
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs uppercase tracking-wider font-bold h-9 px-4"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleStartEditing} 
                className="text-xs uppercase tracking-wider font-bold h-9 px-4 bg-amber-500 text-neutral-950 hover:bg-amber-400"
              >
                <Edit size={14} className="mr-1.5" /> Batch Edit Stock
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* 2. INVENTORY ITEMS TABLE */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Color</th>
                <th className="p-4">Size</th>
                <th className="p-4">Current Stock Level</th>
                <th className="p-4 text-right">Warehouse Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-medium">
                    No inventory levels match search or filter constraints.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stock < 5;
                  const currentStockVal = isEditing ? (editedStock[item.id] ?? item.stock) : item.stock;
                  
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-mono font-bold text-neutral-700">{item.sku}</td>
                      <td className="p-4 font-semibold text-neutral-900">{item.name}</td>
                      <td className="p-4 text-neutral-500 font-medium">{item.color}</td>
                      <td className="p-4 text-neutral-500 font-medium">{item.size}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className="border border-neutral-200 p-1 w-20 text-center focus:outline-none rounded-sm font-bold bg-neutral-50"
                            aria-label={`Stock level for SKU ${item.sku}`}
                          />
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                            isLowStock 
                              ? "bg-red-50 text-red-700 border-red-200 font-extrabold animate-pulse" 
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {item.stock} UNITS {isLowStock && "(CRITICAL)"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono text-neutral-400 font-semibold flex items-center justify-end gap-1.5">
                        <Layers size={12} /> ZONE-{item.color.slice(0, 2).toUpperCase()}-{item.size}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
