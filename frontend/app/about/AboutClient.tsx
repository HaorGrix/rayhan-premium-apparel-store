"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Sparkles, Leaf, Users, Briefcase, Award, MapPin } from "lucide-react";

interface HubCard {
  title: string;
  description: string;
  href: string;
  image: string;
  icon: React.ReactNode;
  tag: string;
}

const CARDS: HubCard[] = [
  {
    title: "Our Story",
    description: "Discover the heritage of Atelier—from a humble boutique in New York to a global label dedicated to slow, conscious luxury.",
    href: "/about/our-story",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    icon: <BookOpen className="w-4 h-4 text-[#d4af37]" />,
    tag: "HERITAGE",
  },
  {
    title: "Brand Philosophy",
    description: "Explore our dedication to minimalism, design utility, representation, and the belief that clothing should be made to last a lifetime.",
    href: "/about/philosophy",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
    icon: <Heart className="w-4 h-4 text-[#d4af37]" />,
    tag: "VALUES",
  },
  {
    title: "Craftsmanship",
    description: "A look inside our workshops. How our pattern makers, hand-weavers, and master tailors bring luxury silhouettes to life.",
    href: "/about/craftsmanship",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
    icon: <Sparkles className="w-4 h-4 text-[#d4af37]" />,
    tag: "ARTISTRY",
  },
  {
    title: "Sustainability",
    description: "Our ecological commitment. From 100% certified organic fabrics to traceable supply chains and low-impact dyeing methods.",
    href: "/about/sustainability",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    icon: <Leaf className="w-4 h-4 text-[#d4af37]" />,
    tag: "ECOLOGY",
  },
  {
    title: "Meet the Team",
    description: "Get to know the passionate directors, designers, and curators shaping the contemporary voice of modern fashion.",
    href: "/about/team",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    icon: <Users className="w-4 h-4 text-[#d4af37]" />,
    tag: "LEADERSHIP",
  },
  {
    title: "Careers",
    description: "Join the House. We are always seeking passionate individuals to join our design, marketing, and operations teams globally.",
    href: "/about/careers",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    icon: <Briefcase className="w-4 h-4 text-[#d4af37]" />,
    tag: "GROWTH",
  },
  {
    title: "Press Room",
    description: "Read about Atelier's latest collections, awards, and industry recognition featured in leading publications worldwide.",
    href: "/about/press",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    icon: <Award className="w-4 h-4 text-[#d4af37]" />,
    tag: "MEDIA",
  },
];

interface Showroom {
  city: string;
  address: string;
  coords: string;
  image: string;
}

const SHOWROOMS: Showroom[] = [
  { 
    city: "New York", 
    address: "120 Atelier Blvd, Soho, NY 10012", 
    coords: "40.7233° N, 74.0030° W",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80" 
  },
  { 
    city: "Paris", 
    address: "42 Rue du Faubourg Saint-Honoré, 75008", 
    coords: "48.8708° N, 2.3175° E",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80" 
  },
  { 
    city: "Milan", 
    address: "Via Monte Napoleone, 15, 20121", 
    coords: "45.4682° N, 9.1953° E",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80" 
  },
  { 
    city: "Tokyo", 
    address: "5-chōme Minami-Aoyama, Minato City, 107-0062", 
    coords: "35.6617° N, 139.7158° E",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600&auto=format&fit=crop&q=80" 
  },
];

export default function AboutClient() {
  return (
    <div className="space-y-24 max-w-6xl mx-auto">
      {/* Intro section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Welcome to the House
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Where Contemporary Design Meets Timeless Craft
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed max-w-2xl mx-auto">
          Atelier was founded on a simple premise: to create elegant, meticulously tailored apparel that honors both the maker and the environment. Explore our universe below to learn how we translate this vision into every stitch.
        </p>
      </div>

      {/* Grid of Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CARDS.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="group flex flex-col bg-white border border-neutral-200/40 rounded-sm overflow-hidden shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300"
          >
            {/* Card Image */}
            <div className="relative h-60 w-full overflow-hidden bg-neutral-100">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[9px] font-bold tracking-widest text-neutral-900 rounded-xs">
                {card.tag}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#d4af37]/10 rounded-sm">{card.icon}</span>
                  <h3 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-[#d4af37] transition-colors duration-200">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  {card.description}
                </p>
              </div>

              <Link
                href={card.href}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-900 group-hover:text-[#d4af37] transition-colors duration-200 self-start"
              >
                Explore Details
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Footprint / Showrooms Section */}
      <section className="border-t border-neutral-200/60 pt-20 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
            Global Footprint
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl text-neutral-900 font-light tracking-tight">
            Flagship Showrooms
          </h3>
          <p className="text-xs text-neutral-500 font-medium max-w-md mx-auto">
            Experience our fabrics, cuts, and bespoke consultations first-hand at our flagships around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SHOWROOMS.map((room, index) => (
            <motion.div
              key={room.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white border border-neutral-200/50 rounded-sm overflow-hidden shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300 flex flex-col h-full text-left"
            >
              {/* Showroom Portrait Cover */}
              <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                <img
                  src={room.image}
                  alt={room.city}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[8px] font-bold tracking-widest text-neutral-900 rounded-xs flex items-center gap-1">
                  <MapPin size={8} className="text-[#d4af37]" /> {room.coords}
                </div>
              </div>

              {/* Showroom Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-[#d4af37] transition-colors">{room.city}</h4>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">{room.address}</p>
                </div>
                <Link
                  href="/contact" 
                  className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-neutral-950 transition-colors w-fit pt-2 block"
                >
                  Book Stylist Consultation →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
