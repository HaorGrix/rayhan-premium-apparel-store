"use client";

import React from "react";
import { motion } from "framer-motion";
import { Feather, RefreshCw, Layers, ShieldCheck } from "lucide-react";

interface Principle {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const PRINCIPLES: Principle[] = [
  {
    title: "Minimalism & Utility",
    subtitle: "Stripping away the excess",
    description: "We design elements that serve a functional purpose. Minimalist styling ensures our apparel remains highly adaptable, integrating seamlessly into existing wardrobes for both business and leisure.",
    icon: <Feather className="w-5 h-5 text-[#d4af37]" />,
  },
  {
    title: "Longevity over Trends",
    subtitle: "Built to span generations",
    description: "We actively reject seasonal hype cycles. Instead, we invest in structural tailoring, reinforced double-needle stitching, and fabrics that grow softer and develop character as they age.",
    icon: <RefreshCw className="w-5 h-5 text-[#d4af37]" />,
  },
  {
    title: "Inclusivity & Representation",
    subtitle: "Form matches identity",
    description: "Our clothing is tailored with diverse body silhouettes in mind. We provide relaxed, elegant drapery that offers comfort and self-expression, without compromising high-fashion aesthetics.",
    icon: <Layers className="w-5 h-5 text-[#d4af37]" />,
  },
  {
    title: "Conscious Responsibility",
    subtitle: "Honoring nature and craft",
    description: "Every button, thread, and packaging box is selected with ecological longevity in mind. We choose renewable fibers and partner with local workshops to minimize carbon footprint.",
    icon: <ShieldCheck className="w-5 h-5 text-[#d4af37]" />,
  },
];

export default function PhilosophyClient() {
  return (
    <div className="space-y-24 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Core Philosophy
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Designing for Mindful Living
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-md mx-auto leading-relaxed">
          Atelier exists at the intersection of aesthetic discipline and environmental responsibility. We formulate every product decision based on four fundamental pillars.
        </p>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PRINCIPLES.map((principle, index) => (
          <motion.div
            key={principle.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs flex gap-6 hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300 text-left"
          >
            <div className="flex-shrink-0 p-3 bg-neutral-50 rounded-md border border-neutral-100/80 h-fit">
              {principle.icon}
            </div>
            <div className="space-y-2">
              <span className="text-[9px] tracking-widest text-[#d4af37] uppercase font-bold">
                {principle.subtitle}
              </span>
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                {principle.title}
              </h3>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                {principle.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quote Banner */}
      <section className="bg-neutral-950 text-white p-8 sm:p-16 md:p-20 rounded-sm text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="text-[9px] tracking-[0.25em] font-bold text-[#d4af37] uppercase">
            Aesthetic Ethos
          </span>
          <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light italic leading-relaxed text-neutral-100">
            "Simplicity is the ultimate sophistication. We do not design garments to stand out; we design them to reside beautifully in the quiet moments of life."
          </p>
          <div className="w-10 h-[1px] bg-[#d4af37] mx-auto my-6" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
            Atelier Design Studio
          </p>
        </div>
      </section>
    </div>
  );
}
