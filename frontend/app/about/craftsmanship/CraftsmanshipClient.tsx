"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scissors, Ruler, Paintbrush, Award } from "lucide-react";

interface CraftStep {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const CRAFT_STEPS: CraftStep[] = [
  {
    step: "01",
    title: "Fiber Sourcing",
    description: "Our artisans select raw luxury fibers—such as long-staple organic cotton, Grade-A mulberry silk, and extrafine merino wool. Each batch is inspected for fiber length and tensile strength.",
    icon: <Paintbrush className="w-4 h-4 text-[#d4af37]" />,
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80",
  },
  {
    step: "02",
    title: "Pattern Drafting & Toile",
    description: "Before production, our master pattern makers draft silhouettes by hand in our Soho studio. We construct a 'toile' (cotton muslin prototype) to evaluate volume, drape, and body motion.",
    icon: <Scissors className="w-4 h-4 text-[#d4af37]" />,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
  },
  {
    step: "03",
    title: "Precision Cutting",
    description: "Each garment panel is individually cut by hand, matching the grain of the textile precisely. This guarantees that side seams do not twist or torque after wash and wear.",
    icon: <Ruler className="w-4 h-4 text-[#d4af37]" />,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
  },
  {
    step: "04",
    title: "Hand-Finishings",
    description: "From blind-stitched hems to hand-woven buttonholes and horn button placements, our tailoring team finishes each piece manually, giving every garment a distinct bespoke character.",
    icon: <Award className="w-4 h-4 text-[#d4af37]" />,
    image: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f69c?w=600&auto=format&fit=crop&q=80",
  },
];

export default function CraftsmanshipClient() {
  return (
    <div className="space-y-24 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Artistry & Method
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Handcrafted to Endure
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed max-w-md mx-auto">
          At Atelier, we believe the inside of a garment should be as beautiful as the outside. Explore our meticulous craftsmanship pipeline, where time-honored methods meet contemporary engineering.
        </p>
      </div>

      {/* Craft Steps Vertical Grid */}
      <div className="space-y-16 sm:space-y-20">
        {CRAFT_STEPS.map((step, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row items-center gap-8 sm:gap-16 ${
                isEven ? "" : "md:flex-row-reverse"
              }`}
            >
              {/* Image side */}
              <div className="w-full md:w-1/2 relative h-72 sm:h-96 rounded-sm overflow-hidden bg-neutral-100 shadow-xs">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
              </div>

              {/* Text side */}
              <div className="w-full md:w-1/2 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-4xl sm:text-5xl font-extralight text-neutral-300">
                    {step.step}
                  </span>
                  <div className="w-6 h-[1px] bg-neutral-350" />
                  <span className="p-1.5 bg-white border border-neutral-100 rounded-md shadow-xs">
                    {step.icon}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
