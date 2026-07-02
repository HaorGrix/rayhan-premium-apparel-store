"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { CartProvider } from "@/features/cart/CartContext";
import { motion } from "framer-motion";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/about" },
  { name: "Our Story", href: "/about/our-story" },
  { name: "Philosophy", href: "/about/philosophy" },
  { name: "Craftsmanship", href: "/about/craftsmanship" },
  { name: "Sustainability", href: "/about/sustainability" },
  { name: "Meet the Team", href: "/about/team" },
  { name: "Careers", href: "/about/careers" },
  { name: "Press", href: "/about/press" },
];

interface BannerData {
  title: string;
  tag: string;
  image: string;
}

const BANNERS: Record<string, BannerData> = {
  "/about": {
    title: "About the Atelier",
    tag: "The House of Atelier",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/our-story": {
    title: "Our Heritage",
    tag: "Heritage & Vision",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/philosophy": {
    title: "Brand Philosophy",
    tag: "Core Values",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/craftsmanship": {
    title: "Art of Craftsmanship",
    tag: "Master Artistry",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/sustainability": {
    title: "Traceable Ecology",
    tag: "Sustainability Commitments",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/team": {
    title: "People of Atelier",
    tag: "Leadership Team",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/careers": {
    title: "Join the House",
    tag: "Careers & Culture",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
  },
  "/about/press": {
    title: "Press Room",
    tag: "Media & Editorial Features",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&auto=format&fit=crop&q=80",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentBanner = BANNERS[pathname] || BANNERS["/about"];

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        
        {/* Brand Banner Hero */}
        <section className="relative w-full h-[280px] sm:h-[350px] overflow-hidden flex items-center justify-center bg-neutral-900">
          <div className="absolute inset-0 z-0">
            {/* Elegant blurred high-fashion editorial backdrop */}
            <div className="absolute inset-0 bg-neutral-950/40 z-10" />
            <img 
              src={currentBanner.image} 
              alt={currentBanner.title} 
              className="w-full h-full object-cover object-center scale-105 filter brightness-75 select-none transition-all duration-700"
            />
          </div>

          <div className="relative z-20 text-center px-4 max-w-3xl">
            <motion.span 
              key={`${pathname}-tag`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[9px] sm:text-[10px] tracking-[0.3em] font-bold text-[#d4af37] uppercase block"
            >
              {currentBanner.tag}
            </motion.span>
            <motion.h1 
              key={`${pathname}-title`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-tight mt-2 sm:mt-3 block"
            >
              {currentBanner.title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-12 h-[1px] bg-[#d4af37] mx-auto mt-4 sm:mt-6"
            />
          </div>
        </section>

        {/* Secondary Sub-navigation (Sticky on scroll) */}
        <nav className="sticky top-[70px] z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/60 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none">
            <div className="flex space-x-6 sm:space-x-8 md:justify-center py-4 min-w-max">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 py-1 ${
                      isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.span
                        layoutId="activeAboutNav"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 md:py-16">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}
