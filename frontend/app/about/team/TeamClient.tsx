"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom inline SVG icons to ensure cross-version compatibility
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="12" height="12">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="12" height="12">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

const TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Elena Rostova",
    role: "Founder & CEO",
    bio: "With over 15 years in luxury fashion management, Elena founded Atelier to prove that high-fashion aesthetics and strict ecological standards can thrive together.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", email: "elena@atelier.com", website: "#" },
  },
  {
    id: "2",
    name: "Marcus Vance",
    role: "Creative Director",
    bio: "Marcus steers the visual and artistic narrative of the House. His previous work at major Parisian ateliers shapes our signature drape and neutral color palettes.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", website: "#" },
  },
  {
    id: "3",
    name: "Sophia Martinez",
    role: "Head of Design",
    bio: "Sophia oversees the Soho design studio, converting brand concepts into wearable patterns. She is passionate about anatomical pattern-making and garment flow.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", email: "sophia@atelier.com" },
  },
  {
    id: "4",
    name: "Tariq Fletcher",
    role: "Product Dev Lead",
    bio: "Tariq bridges the gap between design concepts and our production mills. He manages fabric sourcing, raw fiber testing, and factory compliance inspections.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", website: "#" },
  },
  {
    id: "5",
    name: "Juliana Cho",
    role: "Marketing Director",
    bio: "Juliana handles global communication, editorial lookbooks, and campaigns. Her focus is sharing Atelier's core values with fashion enthusiasts worldwide.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", email: "juliana@atelier.com" },
  },
  {
    id: "6",
    name: "David Kross",
    role: "CX Manager",
    bio: "David leads our styling concierges. He ensures that every member receives stellar sizing guidance, styling suggestions, and rapid order support.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", website: "#" },
  },
  {
    id: "7",
    name: "Chloe Dupont",
    role: "Operations Manager",
    bio: "Chloe streamlines our logistics, international shipping, warehouse operations, and inventory planning to minimize carbon footprint and transit waste.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    social: { linkedin: "#", email: "chloe@atelier.com", website: "#" },
  },
];

export default function TeamClient() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Split members into 3 columns for staggered layout
  const col1 = TEAM.filter((_, i) => i % 3 === 0);
  const col2 = TEAM.filter((_, i) => i % 3 === 1);
  const col3 = TEAM.filter((_, i) => i % 3 === 2);

  return (
    <section className="relative w-full overflow-hidden bg-white py-12 md:py-24 dark:bg-background">
      {/* Decorative background SVG */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 dark:opacity-10">
        <svg
          className="text-[#d4af37]"
          fill="none"
          height="154"
          viewBox="0 0 460 154"
          width="460"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_494_1104)">
            <path
              d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="40"
            />
          </g>
          <defs>
            <clipPath id="clip0_494_1104">
              <rect fill="white" height="154" width="460" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header Section */}
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
          >
            <Users className="w-5 h-5" />
          </motion.div>

          <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase mb-2">
            People of Atelier
          </span>

          <h1 className="relative mb-6 font-serif text-4xl sm:text-5xl text-neutral-900 font-light tracking-tight dark:text-neutral-100">
            Meet the Leadership Team
            <span className="absolute -top-3 -right-12 -z-10 w-24 text-neutral-200/80 dark:text-neutral-800/50">
              <svg
                fill="none"
                viewBox="0 0 108 86"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M38.8484 16.236L15 43.5793L78.2688 15L18.1218 71L93 34.1172L70.2047 65.2739"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="8"
                />
              </svg>
            </span>
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
            Our team is composed of seasoned designers, developers, and operators united by a shared obsession with craft, quality, and environmental stewardship.
          </p>
        </div>

        {/* Staggered Interactive Layout */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16 select-none w-full py-8">
          {/* ── Left: Photo Grid ── */}
          <div className="flex gap-3 sm:gap-4 md:gap-5 flex-shrink-0 justify-center w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0">
            {/* Column 1 */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              {col1.map((member) => (
                <PhotoCard
                  key={member.id}
                  member={member}
                  className="w-[125px] h-[135px] sm:w-[155px] sm:h-[175px] md:w-[185px] md:h-[205px] lg:w-[195px] lg:h-[215px]"
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                />
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 mt-[55px] sm:mt-[65px] md:mt-[75px] lg:mt-[85px]">
              {col2.map((member) => (
                <PhotoCard
                  key={member.id}
                  member={member}
                  className="w-[135px] h-[145px] sm:w-[170px] sm:h-[190px] md:w-[200px] md:h-[220px] lg:w-[210px] lg:h-[230px]"
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                />
              ))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 mt-[25px] sm:mt-[30px] md:mt-[35px] lg:mt-[40px]">
              {col3.map((member) => (
                <PhotoCard
                  key={member.id}
                  member={member}
                  className="w-[130px] h-[140px] sm:w-[160px] sm:h-[180px] md:w-[190px] md:h-[210px] lg:w-[200px] lg:h-[220px]"
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Member Rows List ── */}
          <div className="flex flex-col gap-5 sm:gap-6 pt-2 flex-1 w-full max-w-lg lg:max-w-none">
            {TEAM.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>
        </div>

        {/* Editorial Testimonial Section */}
        <div className="mx-auto mt-24 max-w-3xl px-6 text-center lg:px-0 border-t border-neutral-200/50 dark:border-neutral-800/40 pt-20">
          <p className="mb-8 font-serif text-lg italic text-neutral-800 leading-relaxed md:text-2xl dark:text-neutral-200">
            &ldquo;The dedication to pattern-making and tailorial precision from the Atelier team is unparalleled. Every garment feels personal, architectural, and crafted to last a lifetime.&rdquo;
          </p>

          <div className="flex flex-col items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#d4af37]/30 p-0.5">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  alt="Vivienne Marcheline"
                  className="h-full w-full object-cover"
                  fill
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  sizes="56px"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Vivienne Marcheline
              </p>
              <p className="text-xs text-neutral-400 tracking-wider font-semibold uppercase mt-0.5">
                Lead Editor, L&apos;Officiel
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Photo Card Sub-component
───────────────────────────────────────── */
function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md cursor-pointer flex-shrink-0 transition-all duration-500 border border-neutral-200/30 dark:border-neutral-800/40",
        className,
        isDimmed ? "opacity-40 scale-95 blur-[0.5px]" : "opacity-100 scale-100",
        isActive ? "border-[#d4af37]/60 shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-102" : ""
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="relative w-full h-full">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="220px"
          className={cn(
            "object-cover transition-all duration-500",
            isActive ? "grayscale-0 brightness-100 scale-105" : "grayscale brightness-75"
          )}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Member Row Sub-component
───────────────────────────────────────── */
function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social.linkedin ?? member.social.email ?? member.social.website;

  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-300 py-3 border-b border-neutral-100 dark:border-neutral-900/60",
        isDimmed ? "opacity-35" : "opacity-100"
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Header Row: Indicator Bullet, Name, Social Links */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-1 rounded-[5px] flex-shrink-0 transition-all duration-300",
            isActive ? "bg-[#d4af37] w-6" : "bg-neutral-300 dark:bg-neutral-800 w-3"
          )}
        />
        
        <span
          className={cn(
            "font-serif text-lg sm:text-xl font-bold leading-none tracking-tight transition-colors duration-300",
            isActive ? "text-[#d4af37]" : "text-neutral-800 dark:text-neutral-200"
          )}
        >
          {member.name}
        </span>

        {/* Social Links reveal on active/hover */}
        {hasSocial && (
          <div
            className={cn(
              "flex items-center gap-2.5 ml-2 transition-all duration-300",
              isActive
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            {member.social.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-neutral-400 hover:text-[#d4af37] hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-150"
                title="LinkedIn"
              >
                <LinkedinIcon />
              </a>
            )}
            {member.social.email && (
              <a
                href={`mailto:${member.social.email}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-neutral-400 hover:text-[#d4af37] hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-150"
                title="Email"
              >
                <Mail size={12} />
              </a>
            )}
            {member.social.website && (
              <a
                href={member.social.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-neutral-400 hover:text-[#d4af37] hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-150"
                title="Website"
              >
                <GlobeIcon />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role Title */}
      <p className="mt-1 pl-[36px] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4af37]/90">
        {member.role}
      </p>

      {/* Expandable Bio Description */}
      <motion.div
        initial={false}
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="overflow-hidden pl-[36px]"
      >
        <p className="text-[12px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-lg leading-relaxed font-medium">
          {member.bio}
        </p>
      </motion.div>
    </div>
  );
}
