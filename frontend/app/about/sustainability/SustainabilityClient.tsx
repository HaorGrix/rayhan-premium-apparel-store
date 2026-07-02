"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf, Award, Globe } from "lucide-react";

interface StatItem {
  number: string;
  label: string;
  detail: string;
}

const STATS: StatItem[] = [
  {
    number: "85%+",
    label: "Certified Organic",
    detail: "Of our textiles are organic, recycled, or responsibly harvested (certified GOTS silk/cotton, OEKO-TEX merino).",
  },
  {
    number: "100%",
    label: "Traceable Supply Chain",
    detail: "We trace every garment from the initial raw fiber harvesting to final weaving, spinning, and cut-and-sew workshops.",
  },
  {
    number: "Zero",
    label: "Landfill Waste",
    detail: "Excess fabric cuttings are shredded and repurposed into insulated lining, moving closer to a closed-loop system.",
  },
];

export default function SustainabilityClient() {
  return (
    <div className="space-y-24 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Ecological Care
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Responsibility In Every Thread
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed max-w-md mx-auto">
          Sustainability is not a marketing initiative; it is our foundation. From raw fiber sourcing to biodegradable packaging, we hold ourselves accountable to strict ecological standards.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-neutral-900 block">
                {stat.number}
              </span>
              <h3 className="font-bold text-neutral-800 text-sm">
                {stat.label}
              </h3>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                {stat.detail}
              </p>
            </div>
            <div className="w-8 h-[2px] bg-[#d4af37] mt-6" />
          </motion.div>
        ))}
      </div>

      {/* Editorial Sourcing Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
        <div className="group relative h-[450px] rounded-sm overflow-hidden bg-neutral-100 shadow-xs border border-neutral-200/40">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
            alt="Sustainability Details"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-750 filter brightness-95"
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[9px] tracking-widest text-[#d4af37] uppercase font-bold">Traceability Statement</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900 leading-snug tracking-tight">Our Sourcing Standards</h3>
          </div>
          
          <div className="space-y-5 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
            <p>
              We believe transparency is key to accountability. We partner exclusively with ethical manufacturers who guarantee fair wages, safe working conditions, and trace their direct raw materials.
            </p>
            <div className="flex gap-4 items-start pt-2">
              <div className="p-2 bg-neutral-50 rounded-md border border-neutral-100 mt-0.5 shrink-0">
                <Leaf className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Organic & Regenerative Fibers</h4>
                <p className="text-neutral-500 mt-1 text-xs leading-relaxed">We source certified organic cotton, mulberry silk, linen, and traceable wool that ensure soil preservation and animal welfare.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-neutral-50 rounded-md border border-neutral-100 mt-0.5 shrink-0">
                <Globe className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Low Impact Dyeing</h4>
                <p className="text-neutral-500 mt-1 text-xs leading-relaxed">Our mills utilize closed-loop dye houses that recycle 98% of processing water and avoid harmful chemicals or synthetic runoff.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-neutral-50 rounded-md border border-neutral-100 mt-0.5 shrink-0">
                <Award className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Circularity Initiatives</h4>
                <p className="text-neutral-500 mt-1 text-xs leading-relaxed">We offer complimentary clothing care instructions and recommend repairs to prolong the lifespan of your Atelier garments.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
