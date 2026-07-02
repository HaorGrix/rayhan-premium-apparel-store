"use client";

import React, { useState } from "react";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsData {
  store_name: string;
  contact_email: string;
  currency: string;
  tax_rate: number;
  free_shipping_threshold: number;
  payment_gateways: Record<string, boolean>;
}

interface SettingsTabProps {
  settings: SettingsData;
  onUpdateSettings: (data: Partial<SettingsData>) => Promise<any>;
}

export function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [storeName, setStoreName] = useState(settings.store_name);
  const [contactEmail, setContactEmail] = useState(settings.contact_email);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(settings.tax_rate);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.free_shipping_threshold);
  const [gateways, setGateways] = useState(settings.payment_gateways);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGatewayToggle = (gateway: string) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: !prev[gateway]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateSettings({
        store_name: storeName,
        contact_email: contactEmail,
        currency,
        tax_rate: Number(taxRate),
        free_shipping_threshold: Number(freeShippingThreshold),
        payment_gateways: gateways
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update store settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs">
        <h3 className="font-serif text-base font-bold mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Settings size={16} className="text-amber-500" />
          Store Identity & Configuration Specifications
        </h3>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-bold border border-green-200 rounded-sm">
            ✓ Store configurations updated and applied successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Brand / Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Official Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pricing Currency Code</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent font-bold"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Local Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                required
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Free Shipping Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                required
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent font-bold"
              />
            </div>

          </div>

          {/* Payment Gateways */}
          <div className="border-t border-neutral-100 pt-6">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 block select-none">Authorized Transaction Gateways</span>
            
            <div className="flex flex-col sm:flex-row gap-6 mt-2 select-none">
              {Object.keys(gateways).map((gw) => (
                <label key={gw} className="flex items-center gap-3 text-xs font-semibold cursor-pointer text-neutral-600 hover:text-black transition-colors">
                  <input
                    type="checkbox"
                    checked={gateways[gw]}
                    onChange={() => handleGatewayToggle(gw)}
                    className="rounded-sm border-neutral-300 focus:ring-neutral-950 focus:outline-none w-4 h-4"
                  />
                  <span className="uppercase">{gw} Integration Gateway</span>
                </label>
              ))}
            </div>
          </div>

          {/* Security alert info */}
          <div className="bg-amber-50/50 border border-amber-250 p-4 rounded-sm flex items-start gap-3 select-none text-xs">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-neutral-800">Operational Specifications Modification Warning</span>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                Changing base currencies or local tax codes immediately impacts live client checkout sessions and invoicing. Make updates during off-peak windows.
              </p>
            </div>
          </div>

          <Button type="submit" isLoading={isSaving} className="text-xs uppercase tracking-wider font-bold w-full sm:w-48 ml-auto">
            <Save size={12} className="mr-1.5" /> Apply Specifications
          </Button>
        </form>
      </div>

    </div>
  );
}
