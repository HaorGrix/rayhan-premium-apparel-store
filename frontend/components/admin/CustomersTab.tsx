"use client";

import React, { useState } from "react";
import { Search, Eye, Mail, Calendar, CreditCard, ShoppingBag, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  order_count: number;
  total_spend: number;
  created_at: string;
}

interface CustomersTabProps {
  customers: Customer[];
}

export function CustomersTab({ customers }: CustomersTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filters logic
  const filteredCustomers = customers.filter(c => {
    const searchLower = search.toLowerCase();
    return c.email.toLowerCase().includes(searchLower) ||
           c.first_name.toLowerCase().includes(searchLower) ||
           c.last_name.toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* 1. SEARCH TOOLBAR */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex items-center gap-3 w-full sm:max-w-md focus-within:border-black transition-colors select-none shadow-xs">
        <Search size={16} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search by name, email, or client ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
          aria-label="Search customers"
        />
      </div>

      {/* 2. CUSTOMERS LIST TABLE */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4 font-mono">Lifetime LTV</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-medium">
                    No customers matching current query specifications.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-bold text-neutral-900">{c.first_name} {c.last_name}</td>
                    <td className="p-4 text-neutral-600 font-medium">{c.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold border ${
                        c.is_verified 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-neutral-100 text-neutral-700 border-neutral-200"
                      }`}>
                        {c.is_verified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600 font-mono font-semibold">{c.order_count} Orders</td>
                    <td className="p-4 font-bold text-neutral-800">{formatCurrency(c.total_spend)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                        title="View customer metrics drawer"
                        aria-label={`View customer ${c.first_name} ${c.last_name}`}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CUSTOMER PROFILE SUMMARY DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between text-xs animate-slide-in">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 select-none">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer Details</span>
              <h3 className="font-serif text-base font-bold text-neutral-900">{selectedCustomer.first_name} {selectedCustomer.last_name}</h3>
            </div>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-md transition-colors"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 text-left">
            
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-100 p-4 rounded-sm flex flex-col gap-1 bg-white shadow-2xs">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <CreditCard size={10} /> Lifetime Value (LTV)
                </span>
                <span className="font-serif text-lg font-bold text-neutral-900 mt-1">{formatCurrency(selectedCustomer.total_spend)}</span>
              </div>
              <div className="border border-neutral-100 p-4 rounded-sm flex flex-col gap-1 bg-white shadow-2xs">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <ShoppingBag size={10} /> Average Order Value
                </span>
                <span className="font-serif text-lg font-bold text-neutral-900 mt-1">
                  {selectedCustomer.order_count > 0 
                    ? formatCurrency(selectedCustomer.total_spend / selectedCustomer.order_count) 
                    : "$0.00"}
                </span>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Client Identification</span>
              <div className="bg-neutral-50 p-4 border border-neutral-150 rounded-sm font-semibold flex flex-col gap-1.5 text-neutral-700">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-neutral-400" />
                  <span className="text-neutral-900 font-mono text-[11px]">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-neutral-400" />
                  <span>Joined Date: {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 w-3 text-center font-bold">#</span>
                  <span>System ID: <span className="font-mono text-[10px]">{selectedCustomer.id}</span></span>
                </div>
              </div>
            </div>

            {/* Internal Notes / Customer Tags */}
            <div className="flex flex-col gap-2 select-none">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Internal CRM Tagging</span>
              <div className="flex gap-2 mt-1">
                <span className="px-2.5 py-1 bg-neutral-100 border text-neutral-700 text-[10px] font-bold uppercase rounded-sm">
                  {selectedCustomer.total_spend > 500 ? "VIP CUSTOMER" : "REGULAR BUYER"}
                </span>
                <span className="px-2.5 py-1 bg-neutral-100 border text-neutral-700 text-[10px] font-bold uppercase rounded-sm">
                  {selectedCustomer.is_verified ? "SECURE ACCOUNT" : "PENDING EMAIL CONFIRM"}
                </span>
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 select-none">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-3 px-4 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-wider rounded-sm cursor-pointer text-center"
            >
              Dismiss Profile View
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
