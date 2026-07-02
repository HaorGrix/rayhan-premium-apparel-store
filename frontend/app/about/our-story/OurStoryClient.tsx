"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Compass, ShieldCheck, MapPin } from "lucide-react";

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MILESTONES: Milestone[] = [
  {
    year: "2018",
    title: "The Seed is Sown",
    description: "Atelier begins as a small creative studio in Lower Manhattan. Founded with a single sewing machine and a vision to make luxury fashion transparent, ethical, and built to last.",
    icon: <Compass className="w-4 h-4 text-[#d4af37]" />,
  },
  {
    year: "2020",
    title: "Conscious Debut Collection",
    description: "We launch our first collection of gender-neutral silk shirts and tailored trousers. Utilizing 100% deadstock fabrics, the capsule sells out within 48 hours, establishing a demand for slow luxury.",
    icon: <Calendar className="w-4 h-4 text-[#d4af37]" />,
  },
  {
    year: "2023",
    title: "Partnering with Artisans",
    description: "Atelier expands production by partnering with generations-old family mills in Biella, Italy and Porto, Portugal, securing responsible fabric sourcing and fair-wage tailoring.",
    icon: <ShieldCheck className="w-4 h-4 text-[#d4af37]" />,
  },
  {
    year: "Present",
    title: "A Global Community",
    description: "Today, Atelier operates a flagship studio in Soho and ships worldwide. While growing, we remain committed to limited-batch productions to eliminate waste and celebrate pure design.",
    icon: <MapPin className="w-4 h-4 text-[#d4af37]" />,
  },
];

export default function OurStoryClient() {
  return (
    <div className="space-y-24 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Heritage & Vision
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Crafting the Future of Contemporary Garments
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
      </div>

      {/* Editorial Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
          <p>
            Atelier was born from a reaction against the disposable cycle of fast fashion. Our founder wanted to restore the emotional connection between a wearer and their wardrobe—crafting garments that tell a story, support communities, and endure across seasons.
          </p>
          <p>
            Every silhouette we release goes through months of rigorous fit-testing and refinement in our Soho studio. We analyze drape, stitch strength, seam placement, and ease of motion. We choose only high-grade natural textiles—mulesing-free wools, organic silks, and long-staple cottons—that wear beautifully with time.
          </p>
          <div className="border-l border-[#d4af37] pl-4 italic text-neutral-800 font-serif text-base sm:text-lg my-6 leading-relaxed">
            "A garment is not merely something we wear; it is an environment we occupy. It should embody peace, precision, and structural respect."
          </div>
        </div>

        <div className="relative h-[400px] rounded-sm overflow-hidden bg-neutral-100 shadow-xs">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"
            alt="Atelier Workshop"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-16 pt-12">
        <div className="text-center space-y-2">
          <h3 className="font-serif text-2xl sm:text-4xl text-neutral-900 font-light tracking-tight">Our Timeline</h3>
          <p className="text-[10px] tracking-widest text-[#d4af37] uppercase font-bold mt-2">Key Milestones Along Our Journey</p>
        </div>

        <div className="relative border-l border-neutral-200 ml-4 md:ml-0 md:grid md:grid-cols-2 md:border-l-0 md:gap-x-12 md:gap-y-16 md:before:absolute md:before:left-1/2 md:before:top-0 md:before:bottom-0 md:before:w-[1px] md:before:bg-neutral-200">
          {MILESTONES.map((milestone, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isEven ? -35 : 35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative pl-8 md:pl-0 md:w-full flex flex-col mb-12 last:mb-0 md:mb-0 ${
                  isEven ? "md:text-right md:pr-12 md:items-end" : "md:col-start-2 md:pl-12 md:items-start"
                }`}
              >
                {/* Visual marker dot */}
                <div className="absolute left-[-9px] top-1 md:left-auto md:right-auto md:top-1.5 w-4 h-4 rounded-full bg-white border border-[#d4af37] flex items-center justify-center z-10 shadow-xs md:left-1/2 md:-translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                </div>

                <div className="flex items-center gap-3 mb-2">
                  {!isEven && <span className="p-1 bg-white rounded-md shadow-xs border border-neutral-100">{milestone.icon}</span>}
                  <span className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">{milestone.year}</span>
                  {isEven && <span className="p-1 bg-white rounded-md shadow-xs border border-neutral-100">{milestone.icon}</span>}
                </div>

                <h4 className="font-bold text-neutral-800 text-sm mb-2">{milestone.title}</h4>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-md">
                  {milestone.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
