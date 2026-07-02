"use client";

import React, { useState } from "react";
import { Percent, Edit3, Trash2, Calendar, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  start_date: string;
  expiry_date: string;
  max_uses: number;
  uses_count: number;
}

interface CouponsTabProps {
  coupons: Coupon[];
  onNewCouponClick: () => void;
  onDeleteCoupon: (id: string) => void;
}

export function CouponsTab({
  coupons,
  onNewCouponClick,
  onDeleteCoupon
}: CouponsTabProps) {
  const [search, setSearch] = useState("");

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Action Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        <input
          type="text"
          placeholder="Search coupon codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-xs focus:outline-none rounded-sm bg-transparent w-full sm:max-w-md placeholder-neutral-400"
          aria-label="Search coupons"
        />
        <Button onClick={onNewCouponClick} className="text-xs uppercase tracking-wider font-bold h-9 w-full sm:w-auto">
          Generate New Coupon
        </Button>
      </div>

      {/* Coupons grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCoupons.length === 0 ? (
          <div className="border border-neutral-200 p-12 text-center text-neutral-400 font-medium bg-white rounded-sm sm:col-span-2 md:col-span-3 select-none">
            No coupon codes match current query specifications.
          </div>
        ) : (
          filteredCoupons.map((c) => {
            const hasExpired = new Date(c.expiry_date) < new Date();
            const usagePercentage = Math.round((c.uses_count / c.max_uses) * 100);
            
            return (
              <div key={c.id} className="bg-white border border-neutral-200 p-6 rounded-sm shadow-2xs flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-3 select-none">
                    <div className="flex items-center gap-2">
                      <Tag className="text-amber-500 fill-amber-500" size={14} />
                      <span className="font-mono text-base font-bold text-neutral-900">{c.code}</span>
                    </div>
                    <button
                      onClick={() => onDeleteCoupon(c.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-1 select-none">
                      <span className="font-serif text-3xl font-extrabold text-neutral-950">
                        {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">OFF</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium select-none">
                      Min order value: <span className="font-bold text-neutral-800">${c.min_order_value}</span>
                    </p>
                  </div>
                </div>

                {/* Progress uses & expiry */}
                <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-3 select-none">
                  {/* Usage bar */}
                  <div className="flex flex-col gap-1 text-[9px] text-neutral-400 font-mono">
                    <div className="flex justify-between font-semibold">
                      <span>USAGES: {c.uses_count}/{c.max_uses}</span>
                      <span>{usagePercentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${Math.min(usagePercentage, 100)}%` }} />
                    </div>
                  </div>

                  {/* Expiry */}
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={10} /> Exp: {new Date(c.expiry_date).toLocaleDateString()}</span>
                    <span className={`px-1.5 py-0.2 rounded-sm font-bold border ${
                      hasExpired 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {hasExpired ? "EXPIRED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
