"use client";

import React, { useState } from "react";
import { Mail, Send, Award, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
}

interface MarketingTabProps {
  subscribers: Subscriber[];
  onSendNewsletter: (subject: string, content: string) => Promise<any>;
}

export function MarketingTab({ subscribers, onSendNewsletter }: MarketingTabProps) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const filteredSubs = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;
    
    setIsSending(true);
    setSendSuccess(null);
    try {
      const res = await onSendNewsletter(subject, content);
      setSendSuccess(`Successfully dispatched campaign to ${res.sent_count} active newsletter subscribers!`);
      setSubject("");
      setContent("");
    } catch (err: any) {
      alert(err.message || "Failed to dispatch email campaign.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Newsletter Dispatch Compose form */}
      <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-xs">
        <h3 className="font-serif text-base font-bold mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Mail size={16} className="text-amber-500" />
          Broadcast Seasonal Newsletter Announcement
        </h3>
        
        {sendSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-bold border border-green-200 rounded-sm">
            ✓ {sendSuccess}
          </div>
        )}

        <form onSubmit={handleDispatch} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Subject Header</label>
            <input
              type="text"
              placeholder="e.g. The Autumn Equinox Collection — Private Release Preview"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Newsletter Content (HTML/Text)</label>
            <textarea
              rows={5}
              placeholder="Draft your fashion narrative, promotion coupon mentions, and collection links here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent"
            />
          </div>

          <Button type="submit" isLoading={isSending} className="text-xs uppercase tracking-wider font-bold w-full sm:w-48 ml-auto">
            <Send size={12} className="mr-1.5" /> Dispatch Broadcast
          </Button>
        </form>
      </div>

      {/* Subscribers directory */}
      <div className="bg-white border border-neutral-200 p-6 rounded-sm">
        <h3 className="font-serif text-base font-bold mb-4">Newsletter Members Directory</h3>
        
        <div className="flex items-center gap-3 px-3 py-2 border border-neutral-200 rounded-sm w-full sm:max-w-md mb-4 focus-within:border-black transition-colors select-none">
          <Search size={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search email members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
            aria-label="Search subscribers"
          />
        </div>

        <div className="overflow-x-auto shadow-2xs border border-neutral-200 rounded-sm">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-3">Subscriber Email</th>
                <th className="p-3">Opt-in status</th>
                <th className="p-3 text-right">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-neutral-400 font-medium">
                    No newsletter members found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800">{sub.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-sm text-[8px] font-bold border bg-green-50 text-green-700 border-green-200">
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-400 font-semibold">
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
