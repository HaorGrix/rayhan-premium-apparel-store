"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Globe, 
  ChevronUp, 
  ChevronDown, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Floating back to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mobile accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    company: false,
    support: false,
    legal: false
  });

  // Country / Currency / Language selection states
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("EN");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    // Simulate premium luxury membership registration
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  return (
    <footer className="w-full border-t border-neutral-200 bg-[#fafafa] text-neutral-600 font-sans relative overflow-hidden select-none">
      
      {/* 1. TRUST & SERVICE HIGHLIGHTS (TOP SECTION) */}
      <div className="border-b border-neutral-200/50 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            {/* Highlight 1 */}
            <div className="flex flex-col items-center p-3 gap-2">
              <div className="p-3 bg-white rounded-full border border-neutral-200 text-neutral-800 shadow-2xs hover:scale-105 hover:border-[#d4af37]/40 transition-all duration-300">
                <Truck size={18} strokeWidth={1.5} />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Free Express Shipping</h5>
              <p className="text-xs text-neutral-500 font-medium max-w-[170px] leading-relaxed">Complimentary delivery on all orders over $150.</p>
            </div>
            
            {/* Highlight 2 */}
            <div className="flex flex-col items-center p-3 gap-2">
              <div className="p-3 bg-white rounded-full border border-neutral-200 text-neutral-800 shadow-2xs hover:scale-105 hover:border-[#d4af37]/40 transition-all duration-300">
                <RotateCcw size={18} strokeWidth={1.5} />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Complimentary Returns</h5>
              <p className="text-xs text-neutral-500 font-medium max-w-[170px] leading-relaxed">Exchange or return unworn garments within 30 days.</p>
            </div>

            {/* Highlight 3 */}
            <div className="flex flex-col items-center p-3 gap-2">
              <div className="p-3 bg-white rounded-full border border-neutral-200 text-neutral-800 shadow-2xs hover:scale-105 hover:border-[#d4af37]/40 transition-all duration-300">
                <ShieldCheck size={18} strokeWidth={1.5} />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Secure Checkout</h5>
              <p className="text-xs text-neutral-500 font-medium max-w-[170px] leading-relaxed">PCI-compliant secure bank and mobile transactions.</p>
            </div>

            {/* Highlight 4 */}
            <div className="flex flex-col items-center p-3 gap-2">
              <div className="p-3 bg-white rounded-full border border-neutral-200 text-neutral-800 shadow-2xs hover:scale-105 hover:border-[#d4af37]/40 transition-all duration-300">
                <Award size={18} strokeWidth={1.5} />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Atelier Quality</h5>
              <p className="text-xs text-neutral-500 font-medium max-w-[170px] leading-relaxed">Crafted with ethically-sourced luxury organic yarns.</p>
            </div>

          </div>
        </div>
      </div>

      {/* 2. PREMIUM NEWSLETTER & MEMBERSHIP */}
      <div className="border-b border-neutral-200/50 py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            <div className="lg:col-span-6 flex flex-col gap-2">
              <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-[#d4af37]">Atelier Membership</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">Become an Atelier Member</h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mt-1 leading-relaxed">
                Join our premium community to gain exclusive updates, seasonal lookbooks, private pre-access events, and bespoke member rewards.
              </p>
              
              {/* Membership Benefits List */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-xs text-neutral-600 font-medium select-none">
                <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-[#d4af37]" /> Early collection pre-access</span>
                <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-[#d4af37]" /> Exclusive lookbooks</span>
                <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-[#d4af37]" /> Private members offers</span>
                <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-[#d4af37]" /> Birthday styling gifts</span>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col w-full">
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-start gap-2 p-5 border border-neutral-200 bg-[#fafafa] rounded-sm w-full"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-xs select-none">Registration Success</span>
                    <h4 className="font-serif text-lg font-bold text-neutral-900 mt-1">Welcome to ATELIER</h4>
                    <p className="text-[11px] text-neutral-650 leading-relaxed max-w-sm text-left">
                      Your membership is now active. Please check your inbox for a verification email containing details of your styling benefits.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full max-w-md">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          className="w-full border border-neutral-200 focus:border-neutral-400 bg-[#fcfcfc] px-3 py-3 text-xs text-neutral-900 focus:outline-none transition-all duration-300 tracking-wide rounded-sm font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-sm transition-all duration-300 shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            Join <ArrowRight size={12} />
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-400 leading-relaxed text-left select-none font-medium">
                      By joining, you agree to our Privacy Policy and Terms of Service. You can opt out at any time.
                    </span>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN FOOTER COLUMNS */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#fafafa] border-b border-neutral-200/50">
        
        {/* Desktop grid & Mobile accordions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 text-left">
          
          {/* Column 1: Brand & Socials (Always expanded) */}
          <div className="flex flex-col gap-5 text-left md:col-span-1">
            <span className="font-serif text-2xl font-light tracking-[0.15em] text-neutral-900 select-none uppercase">ATELIER</span>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-[240px] select-none font-medium">
              Crafting premium contemporary fashion and timeless apparel. We design wardrobe staples with sustainability, quality, and minimalism in mind.
            </p>
            {/* Social Media Links */}
            {/* Social Media Links */}
            <div className="flex gap-3 mt-3 select-none items-center font-medium">
              
              {/* Instagram */}
              <div className="relative group/social">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#ee2a7b] text-white text-[8px] font-bold tracking-widest uppercase rounded-xs opacity-0 scale-95 group-hover/social:opacity-100 group-hover/social:scale-100 group-hover/social:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-30">
                  Instagram
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#ee2a7b]" />
                </div>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white text-neutral-550 hover:text-white hover:border-transparent hover:scale-110 hover:rotate-3 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] transition-all duration-300 shadow-3xs hover:shadow-md"
                >
                  <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>

              {/* Pinterest */}
              <div className="relative group/social">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#bd081c] text-white text-[8px] font-bold tracking-widest uppercase rounded-xs opacity-0 scale-95 group-hover/social:opacity-100 group-hover/social:scale-100 group-hover/social:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-30">
                  Pinterest
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#bd081c]" />
                </div>
                <a 
                  href="https://pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white text-neutral-550 hover:text-white hover:border-transparent hover:scale-110 hover:rotate-3 hover:bg-[#bd081c] transition-all duration-300 shadow-3xs hover:shadow-md"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12.248 8c-3.19 0-5.541 2.36-5.541 5.414 0 2.12.8 3.53 2.23 4.14.23.1.33.07.38-.13.08-.34.25-1.01.35-1.37.05-.18.02-.27-.12-.44-.46-.57-.85-1.7-.85-3.003 0-3.266 2.37-6.207 6.36-6.207 3.478 0 5.902 2.38 5.902 5.564 0 3.868-2.185 6.574-4.825 6.574-1.5 0-2.617-1.192-2.257-2.656.43-1.76 1.272-3.66 1.272-4.937 0-1.14-.638-2.09-1.96-2.09-1.56 0-2.808 1.55-2.808 3.63 0 1.32.463 2.22.463 2.22l-1.57 6.347c-.5 2.112-.07 4.7-.03 5 .02.13.08.16.16.07.12-.16 1.7-2.1 2.23-4.02l.96-3.877c.5.918 1.956 1.72 3.51 1.72 4.62 0 7.74-4.053 7.74-9.467C22.068 11.2 17.868 8 12.248 8z"/></svg>
                </a>
              </div>

              {/* TikTok */}
              <div className="relative group/social">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-black text-white text-[8px] font-bold tracking-widest uppercase rounded-xs opacity-0 scale-95 group-hover/social:opacity-100 group-hover/social:scale-100 group-hover/social:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-30">
                  TikTok
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                </div>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white text-neutral-550 hover:text-white hover:border-transparent hover:scale-110 hover:rotate-3 hover:bg-black transition-all duration-300 shadow-3xs hover:shadow-md"
                >
                  <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
              </div>

              {/* Facebook */}
              <div className="relative group/social">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#1877f2] text-white text-[8px] font-bold tracking-widest uppercase rounded-xs opacity-0 scale-95 group-hover/social:opacity-100 group-hover/social:scale-100 group-hover/social:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-30">
                  Facebook
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1877f2]" />
                </div>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white text-neutral-550 hover:text-white hover:border-transparent hover:scale-110 hover:rotate-3 hover:bg-[#1877f2] transition-all duration-300 shadow-3xs hover:shadow-md"
                >
                  <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>

              {/* YouTube */}
              <div className="relative group/social">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#ff0000] text-white text-[8px] font-bold tracking-widest uppercase rounded-xs opacity-0 scale-95 group-hover/social:opacity-100 group-hover/social:scale-100 group-hover/social:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-30">
                  YouTube
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#ff0000]" />
                </div>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white text-neutral-550 hover:text-white hover:border-transparent hover:scale-110 hover:rotate-3 hover:bg-[#ff0000] transition-all duration-300 shadow-3xs hover:shadow-md"
                >
                  <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/></svg>
                </a>
              </div>

            </div>
          </div>

          {/* Column 2: Shop links (Accordion on mobile) */}
          <div className="flex flex-col border-b border-neutral-200 md:border-b-0 pb-4 md:pb-0">
            <button 
              type="button" 
              onClick={() => toggleSection("shop")} 
              className="flex justify-between items-center w-full md:cursor-default text-left md:pointer-events-none select-none"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 md:mb-4">Shop</h4>
              <span className="block md:hidden text-neutral-500">
                {openSections.shop ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            
            {/* Desktop Link list - Static CSS driven for instant SSR/SEO crawling */}
            <div className="hidden md:flex flex-col gap-2.5 text-xs text-neutral-600 font-medium mt-4">
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">New Arrivals<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Best Sellers<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Collections<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products?category=men" className="hover:text-neutral-950 transition-colors relative group w-fit">Men's Apparel<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products?category=women" className="hover:text-neutral-950 transition-colors relative group w-fit">Women's Apparel<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products?category=accessories" className="hover:text-neutral-950 transition-colors relative group w-fit">Accessories<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Shoes<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Campaigns<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="text-[#d4af37] hover:text-[#b08c25] transition-colors relative group w-fit">Sale<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Gift Cards<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
            </div>

            {/* Mobile Link list - Client animated Accordion */}
            <div className="md:hidden">
              <AnimatePresence initial={false}>
                {openSections.shop && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2 flex flex-col gap-2.5 text-xs text-neutral-600 font-medium"
                  >
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">New Arrivals<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Best Sellers<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Collections<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products?category=men" className="hover:text-neutral-950 transition-colors relative group w-fit">Men's Apparel<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products?category=women" className="hover:text-neutral-950 transition-colors relative group w-fit">Women's Apparel<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products?category=accessories" className="hover:text-neutral-950 transition-colors relative group w-fit">Accessories<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Shoes<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Campaigns<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="text-[#d4af37] hover:text-[#b08c25] transition-colors relative group w-fit">Sale<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/products" className="hover:text-neutral-950 transition-colors relative group w-fit">Gift Cards<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Company links (Accordion on mobile) */}
          <div className="flex flex-col border-b border-neutral-200 md:border-b-0 pb-4 md:pb-0">
            <button 
              type="button" 
              onClick={() => toggleSection("company")} 
              className="flex justify-between items-center w-full md:cursor-default text-left md:pointer-events-none select-none"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 md:mb-4">Company</h4>
              <span className="block md:hidden text-neutral-500">
                {openSections.company ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            
            {/* Desktop Link list - Static CSS driven */}
            <div className="hidden md:flex flex-col gap-2.5 text-xs text-neutral-600 font-medium mt-4">
              <Link href="/about" className="hover:text-neutral-950 transition-colors relative group w-fit">About Atelier<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/our-story" className="hover:text-neutral-950 transition-colors relative group w-fit">Our Story<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/philosophy" className="hover:text-neutral-950 transition-colors relative group w-fit">Brand Philosophy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/craftsmanship" className="hover:text-neutral-950 transition-colors relative group w-fit">Craftsmanship<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/sustainability" className="hover:text-neutral-950 transition-colors relative group w-fit">Sustainability<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/careers" className="hover:text-neutral-950 transition-colors relative group w-fit">Careers<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/about/press" className="hover:text-neutral-950 transition-colors relative group w-fit">Press Room<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
            </div>

            {/* Mobile Link list - Client animated Accordion */}
            <div className="md:hidden">
              <AnimatePresence initial={false}>
                {openSections.company && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2 flex flex-col gap-2.5 text-xs text-neutral-600 font-medium"
                  >
                    <Link href="/about" className="hover:text-neutral-950 transition-colors relative group w-fit">About Atelier<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/our-story" className="hover:text-neutral-950 transition-colors relative group w-fit">Our Story<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/philosophy" className="hover:text-neutral-950 transition-colors relative group w-fit">Brand Philosophy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/craftsmanship" className="hover:text-neutral-950 transition-colors relative group w-fit">Craftsmanship<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/sustainability" className="hover:text-neutral-950 transition-colors relative group w-fit">Sustainability<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/careers" className="hover:text-neutral-950 transition-colors relative group w-fit">Careers<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/about/press" className="hover:text-neutral-950 transition-colors relative group w-fit">Press Room<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 4: Customer Support links (Accordion on mobile) */}
          <div className="flex flex-col border-b border-neutral-200 md:border-b-0 pb-4 md:pb-0">
            <button 
              type="button" 
              onClick={() => toggleSection("support")} 
              className="flex justify-between items-center w-full md:cursor-default text-left md:pointer-events-none select-none"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 md:mb-4">Support</h4>
              <span className="block md:hidden text-neutral-500">
                {openSections.support ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            
            {/* Desktop Link list - Static CSS driven */}
            <div className="hidden md:flex flex-col gap-2.5 text-xs text-neutral-600 font-medium mt-4">
              <Link href="/contact" className="hover:text-neutral-950 transition-colors relative group w-fit">Contact Concierge<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Shipping & Customs<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Returns & Exchanges<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Frequently Asked Questions<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact" className="hover:text-neutral-950 transition-colors relative group w-fit">Track My Order<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Garment Size Guide<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/contact" className="hover:text-[#d4af37] hover:underline transition-colors relative group w-fit font-bold">Live Chat Support Concierge</Link>
            </div>

            {/* Mobile Link list - Client animated Accordion */}
            <div className="md:hidden">
              <AnimatePresence initial={false}>
                {openSections.support && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2 flex flex-col gap-2.5 text-xs text-neutral-600 font-medium"
                  >
                    <Link href="/contact" className="hover:text-neutral-950 transition-colors relative group w-fit">Contact Concierge<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Shipping & Customs<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Returns & Exchanges<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Frequently Asked Questions<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact" className="hover:text-neutral-950 transition-colors relative group w-fit">Track My Order<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact#faqs" className="hover:text-neutral-950 transition-colors relative group w-fit">Garment Size Guide<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/contact" className="hover:text-[#d4af37] hover:underline transition-colors relative group w-fit font-bold font-sans">Live Chat Support Concierge</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 5: Legal links (Accordion on mobile) */}
          <div className="flex flex-col pb-4 md:pb-0">
            <button 
              type="button" 
              onClick={() => toggleSection("legal")} 
              className="flex justify-between items-center w-full md:cursor-default text-left md:pointer-events-none select-none"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 md:mb-4">Legal</h4>
              <span className="block md:hidden text-neutral-500">
                {openSections.legal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            
            {/* Desktop Link list - Static CSS driven */}
            <div className="hidden md:flex flex-col gap-2.5 text-xs text-neutral-600 font-medium mt-4">
              <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Privacy Policy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/terms" className="hover:text-neutral-950 transition-colors relative group w-fit">Terms of Service<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/cookies" className="hover:text-neutral-950 transition-colors relative group w-fit">Cookie Settings<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Accessibility Standards<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
              <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Refund & Claims Policy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
            </div>

            {/* Mobile Link list - Client animated Accordion */}
            <div className="md:hidden">
              <AnimatePresence initial={false}>
                {openSections.legal && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2 flex flex-col gap-2.5 text-xs text-neutral-600 font-medium"
                  >
                    <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Privacy Policy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/terms" className="hover:text-neutral-950 transition-colors relative group w-fit">Terms of Service<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/cookies" className="hover:text-neutral-950 transition-colors relative group w-fit">Cookie Settings<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Accessibility Standards<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                    <Link href="/privacy" className="hover:text-neutral-950 transition-colors relative group w-fit">Refund & Claims Policy<span className="absolute bottom-0 left-0 w-0 h-0.25 bg-[#d4af37] group-hover:w-full transition-all duration-300" /></Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* 4. DETAILED CONTACT BLOCK IN SUBGRID */}
        <div className="mt-12 pt-8 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-neutral-500 text-xs text-left select-none">
          <div className="flex gap-2.5 items-start">
            <span className="text-neutral-400 mt-0.5"><Phone size={14} /></span>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">Direct Hotline</span>
              <a href="tel:+18005550199" className="hover:text-[#d4af37] font-medium mt-0.5 text-neutral-800 transition-colors">+1 (800) 555-0199</a>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-neutral-400 mt-0.5"><Mail size={14} /></span>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">Email Assistance</span>
              <a href="mailto:care@atelier.com" className="hover:text-[#d4af37] font-medium mt-0.5 text-neutral-800 transition-colors">care@atelier.com</a>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-neutral-400 mt-0.5"><Clock size={14} /></span>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">Concierge Availability</span>
              <span className="font-medium text-neutral-800 mt-0.5">Mon - Fri: 9AM - 6PM EST</span>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-neutral-400 mt-0.5"><MapPin size={14} /></span>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">Flagship Atelier</span>
              <span className="font-medium text-neutral-800 mt-0.5">120 Atelier Blvd, New York, NY</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. FOOTER BOTTOM: LEGAL, LOCALE SELECTORS & PAYMENT BADGES */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#fafafa] flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-neutral-500 select-none border-t border-neutral-200/40">
        
        {/* Country & Language selectors */}
        <div className="flex flex-wrap gap-6 items-center justify-center">
          
          {/* Country */}
          <div className="flex items-center gap-1 border-b border-neutral-200/60 hover:border-neutral-400 bg-transparent text-neutral-700 pb-0.5 text-xs transition-colors cursor-pointer">
            <Globe size={11} className="text-neutral-400" />
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              className="bg-transparent font-medium focus:outline-none text-neutral-700 cursor-pointer text-xs"
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="JP">Japan</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center gap-1 border-b border-neutral-200/60 hover:border-neutral-400 bg-transparent text-neutral-700 pb-0.5 text-xs transition-colors cursor-pointer">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="bg-transparent font-medium focus:outline-none text-neutral-700 cursor-pointer text-xs"
            >
              <option value="EN">English (EN)</option>
              <option value="FR">Français (FR)</option>
              <option value="DE">Deutsch (DE)</option>
              <option value="JP">日本語 (JP)</option>
            </select>
          </div>

          {/* Currency */}
          <div className="flex items-center gap-1 border-b border-neutral-200/60 hover:border-neutral-400 bg-transparent text-neutral-700 pb-0.5 text-xs transition-colors cursor-pointer">
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)} 
              className="bg-transparent font-medium focus:outline-none text-neutral-700 cursor-pointer text-xs"
            >
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
        </div>

        {/* Copyright notice */}
        <p className="text-[11px] font-medium tracking-wide text-neutral-500">© {new Date().getFullYear()} ATELIER. Handcrafted for global contemporary fashion.</p>

        {/* Payment Icons */}
        <div className="flex gap-2.5 items-center justify-center text-neutral-400">
          {/* Visa */}
          <span className="border border-neutral-200/60 bg-white px-2 py-0.5 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all cursor-pointer" title="Visa">
            <svg className="h-4 w-auto" viewBox="0 0 24 15" fill="currentColor"><path d="M12.24 9.408l.942-5.748h1.536l-.942 5.748H12.24zm6.054-5.592c-.318-.12-.816-.252-1.428-.252-1.578 0-2.694.828-2.7 2.016-.012.876.792 1.362 1.404 1.656.624.3 1.05.618 1.05.954-.006.516-.63.75-1.212.75-.81 0-1.242-.12-1.902-.408l-.264-.126-.282 1.716c.474.216 1.344.402 2.25.408 1.884 0 3.108-.918 3.126-2.346.012-.78-.474-1.374-1.512-1.866-.624-.312-1.008-.522-1.008-.84.006-.294.33-.6.942-.6.552 0 1.008.108 1.332.252l.162.072.336-1.74zm-2.022.012l-1.182 5.736h-1.608L10.8 3.828h1.668l.846 4.14.204.996.486-5.136h1.53zm-8.868 0L5.79 7.698l-.162-.816C5.352 5.868 4.542 4.908 3.6 4.41l.012-.012H6.39l1.272 5.016 1.554-5.586H11.2l-2.4 5.586H7.17L5.136 3.828H3.456z"/></svg>
          </span>
          {/* Mastercard */}
          <span className="border border-neutral-200/60 bg-white px-2 py-0.5 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all cursor-pointer" title="Mastercard">
            <svg className="h-4 w-auto" viewBox="0 0 24 15" fill="currentColor"><circle cx="8" cy="7.5" r="7" fillOpacity="0.8"/><circle cx="16" cy="7.5" r="7" fillOpacity="0.8"/></svg>
          </span>
          {/* Amex */}
          <span className="border border-neutral-200/60 bg-white px-2 py-1 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all text-[6px] tracking-widest font-bold font-sans cursor-pointer" title="American Express">
            AMEX
          </span>
          {/* PayPal */}
          <span className="border border-neutral-200/60 bg-white px-2 py-0.5 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all cursor-pointer" title="PayPal">
            <svg className="h-4 w-auto" viewBox="0 0 24 15" fill="currentColor"><path d="M19.112 3.834c-.317-1.464-1.492-2.334-3.355-2.334H9.426a.63.63 0 0 0-.623.535L6.611 15.656a.434.434 0 0 0 .428.496h2.955a.63.63 0 0 0 .623-.535l.842-5.328a.43.43 0 0 1 .425-.363h1.616c2.909 0 4.673-1.4 5.347-4.227.324-1.362.158-2.617-.735-3.493l-.001-.001zm-3.084 4.093c-.456 1.916-2.03 1.916-3.486 1.916H11.39l.605-3.829h1.152c1.455 0 2.658.077 2.203 1.913h-.322z"/></svg>
          </span>
          {/* Apple Pay */}
          <span className="border border-neutral-200/60 bg-white px-2 py-1 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all text-[6px] tracking-widest font-bold font-sans cursor-pointer" title="Apple Pay">
             PAY
          </span>
          {/* Google Pay */}
          <span className="border border-neutral-200/60 bg-white px-2 py-1 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all text-[6px] tracking-widest font-bold font-sans cursor-pointer" title="Google Pay">
            G PAY
          </span>
          {/* Stripe */}
          <span className="border border-neutral-200/60 bg-white px-2 py-1 rounded-sm hover:text-neutral-900 hover:border-neutral-300 shadow-3xs transition-all text-[6px] tracking-widest font-bold font-sans cursor-pointer" title="Stripe">
            STRIPE
          </span>
        </div>
      </div>

      {/* 6. FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 bg-neutral-950 hover:bg-neutral-800 text-white p-3 rounded-full border border-neutral-900 shadow-md cursor-pointer transition-all hover:scale-105 select-none"
            aria-label="Scroll to top of the page"
          >
            <ChevronUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

    </footer>
  );
}
export default Footer;
