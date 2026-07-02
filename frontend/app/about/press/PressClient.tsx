"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Newspaper, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PressRelease {
  date: string;
  title: string;
  description: string;
  source: string;
}

const RELEASES: PressRelease[] = [
  {
    date: "June 14, 2026",
    title: "Atelier Announces Carbon-Neutral Sourcing Initiative in Biella, Italy",
    description: "In collaboration with traditional mills, Atelier establishes a fully offset logistical supply chain, introducing traceability tracking for 100% of merino wool products.",
    source: "Business of Fashion",
  },
  {
    date: "April 02, 2026",
    title: "The Soho Flagship Receives Architectural Design Excellence Honors",
    description: "Noted for its minimalist steel structures, circular layout, and zero-plastic fitting spaces, our Soho boutique is recognized as a leader in modern experiential luxury retail.",
    source: "Architectural Digest",
  },
  {
    date: "January 20, 2026",
    title: "Atelier Showcases Winter Capsule: A Study in Neutral Drapery",
    description: "Focusing on extra-relaxed silk shackets, linen trousers, and organic knit sweaters, the collection emphasizes raw fabric colors and structural utility.",
    source: "Vogue Editorial",
  },
];

interface FeatureLogo {
  publication: string;
  quote: string;
}

const FEATURES: FeatureLogo[] = [
  { publication: "VOGUE", quote: "Atelier represents the gold standard of contemporary, conscious tailoring. An absolute wardrobe must-have." },
  { publication: "GQ", quote: "Quiet luxury refined. Atelier shirts boast incredible stitching, durable natural buttons, and a flawless relaxed silhouette." },
  { publication: "Harper's BAZAAR", quote: "By fusing ancient artisan milling with transparent ecological tracking, Atelier designs the blueprints for future fashion." },
];

export default function PressClient() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    // Simulate kit download
    setTimeout(() => {
      setDownloaded(false);
    }, 3000);
  };

  return (
    <div className="space-y-24 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          News & Media
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Atelier in the Press
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed max-w-md mx-auto">
          Follow the latest announcements, collections, and press coverage of our designs, awards, and ecological initiatives.
        </p>
      </div>

      {/* Feature Quotes / Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feat, index) => (
          <motion.div
            key={feat.publication}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs flex flex-col justify-between text-left h-full hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-4">
              <span className="font-serif text-2xl tracking-widest font-black text-neutral-900 italic block">
                {feat.publication}
              </span>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed italic">
                "{feat.quote}"
              </p>
            </div>
            <div className="w-6 h-[1.5px] bg-[#d4af37] mt-6" />
          </motion.div>
        ))}
      </div>

      {/* Press Releases & Download */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        {/* Left Side: Releases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">Latest Press Releases</h3>
            <p className="text-[10px] tracking-wider text-neutral-400 uppercase font-semibold mt-1">Official Statements & Announcements</p>
          </div>

          <div className="divide-y divide-neutral-200/60">
            {RELEASES.map((rel) => (
              <div key={rel.title} className="py-6 first:pt-0 last:pb-0 group">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  {rel.date} • {rel.source}
                </span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#d4af37] transition-colors duration-200 flex items-center gap-1.5 cursor-pointer">
                  {rel.title} <ArrowUpRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed mt-2">
                  {rel.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Media Kit Download */}
        <div className="space-y-6 bg-white border border-neutral-200/50 p-6 rounded-sm shadow-xs h-fit self-start hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-[#d4af37]/10 rounded-md text-[#d4af37] w-fit">
            <Newspaper size={20} />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-neutral-900">Download Media Kit</h4>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              Access high-resolution lookbooks, flagship studio photos, brand guidelines, and official bios of our executive leadership team.
            </p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloaded}
            className={`w-full uppercase text-[10px] tracking-widest font-bold py-3.5 h-auto rounded-sm flex items-center justify-center gap-2 transition-all ${
              downloaded 
                ? "bg-green-600 hover:bg-green-600 text-white" 
                : "bg-neutral-950 text-white hover:bg-neutral-800"
            }`}
          >
            {downloaded ? (
              <>
                <CheckCircle2 size={14} /> Download Initiated...
              </>
            ) : (
              <>
                <Download size={14} /> Download Assets (.ZIP)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
