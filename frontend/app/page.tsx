"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/features/cart/CartContext";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { InstagramGallery } from "@/components/common/InstagramGallery";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  price: number;
  discount_price?: number;
  images: { id: string; image_url: string; sort_order: number }[];
  variants: { id: string; sku: string; color: string; size: string; stock: number; price_override?: number | null }[];
  average_rating?: number;
  reviews_count?: number;
}

interface CampaignData {
  id: string;
  name: string;
  slug: string;
  promotional_copy: string;
  badge: string;
  cta_text: string;
  cta_link: string;
  desktop_banner_url: string;
  mobile_banner_url: string;
  priority: number;
}

interface GalleryData {
  id: string;
  product_id: string;
  image_url: string;
  caption: string;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount_price?: number;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  product?: { name: string };
}

const FALLBACK_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Summer Campaign",
    slug: "summer-campaign",
    promotional_copy: "Refined staples crafted in lightweight organic fabrics. Designed to breathe, made to endure.",
    badge: "NEW SEASON",
    cta_text: "Shop Summer Campaign",
    cta_link: "/products?collection=summer-collection",
    desktop_banner_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600",
    mobile_banner_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600",
    priority: 10
  }
];

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>(FALLBACK_CAMPAIGNS);
  const [newArrivals, setNewArrivals] = useState<ProductData[]>([]);
  const [trending, setTrending] = useState<ProductData[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductData[]>([]);
  const [gallery, setGallery] = useState<GalleryData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel Active Index
  const [activeSlide, setActiveSlide] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch Homepage Data on Mount
  useEffect(() => {
    async function fetchHomeData() {
      setIsLoading(true);
      try {
        // Campaigns
        const cRes = await fetch("http://localhost:8000/api/v1/campaigns/active");
        if (cRes.ok) {
          const cData = await cRes.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setCampaigns(cData);
          }
        }
      } catch (e) { console.warn("Failed fetching active campaigns."); }

      try {
        // Products catalog
        const pRes = await fetch("http://localhost:8000/api/v1/products?limit=8");
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.products) {
            setNewArrivals(pData.products);
            setTrending(pData.products.slice(0, 4));
            setBestSellers(pData.products.slice().reverse().slice(0, 4));
          }
        }
      } catch (e) { console.warn("Failed fetching catalog products."); }

      try {
        // Lookbook gallery
        const gRes = await fetch("http://localhost:8000/api/v1/gallery/approved");
        if (gRes.ok) {
          const gData = await gRes.json();
          setGallery(gData);
        }
      } catch (e) { console.warn("Failed fetching approved gallery lookbooks."); }

      try {
        // Reviews
        const rRes = await fetch("http://localhost:8000/api/v1/products/reviews");
        if (rRes.ok) {
          const rData = await rRes.json();
          setReviews(rData.filter((r: any) => r.status === "approved").slice(0, 3));
        }
      } catch (e) { console.warn("Failed fetching reviews."); }

      setIsLoading(false);
    }

    fetchHomeData();
  }, []);

  // Setup Auto Slide Interval
  useEffect(() => {
    if (campaigns.length <= 1) return;

    startSlideTimer();

    return () => {
      stopSlideTimer();
    };
  }, [campaigns, activeSlide]);

  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % campaigns.length);
    }, 8000); // cycle slide every 8 seconds
  };

  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const handlePrevSlide = () => {
    stopSlideTimer();
    setActiveSlide((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const handleNextSlide = () => {
    stopSlideTimer();
    setActiveSlide((prev) => (prev + 1) % campaigns.length);
  };

  const mapProduct = (p: any) => {
    const stockCount = p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand?.name || (typeof p.brand === "string" ? p.brand : "Atelier"),
      price: Number(p.price),
      discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
      imageUrl: p.images && p.images[0]?.image_url || p.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
      images: p.images || [],
      variants: p.variants || [],
      average_rating: p.average_rating || 5.0,
      reviews_count: p.reviews_count || 10,
      isAvailable: stockCount > 0
    };
  };

  const activeCamp = campaigns[activeSlide] || campaigns[0] || FALLBACK_CAMPAIGNS[0];

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Header />
        
        <main className="flex-grow">
          
          {/* 1. HERO CAMPAIGN CAROUSEL WITH KEN BURNS EFFECT */}
          <section className="relative h-[85vh] w-full bg-neutral-900 overflow-hidden group">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/25 z-10" />
            
            {/* Background Image Banner (Ken Burns zoom + crossfade) */}
            <AnimatePresence mode="popLayout">
              <motion.img
                key={activeSlide}
                src={activeCamp.desktop_banner_url}
                alt={activeCamp.name}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1.07 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  opacity: { duration: 1.2 },
                  scale: { duration: 8, ease: "easeOut" }
                }}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Content Text Block (Staggered Animation) */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.15,
                          delayChildren: 0.2
                        }
                      }
                    }}
                    className="max-w-xl flex flex-col gap-6 text-white drop-shadow-sm select-none"
                  >
                    {activeCamp.badge && (
                      <motion.span
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground bg-primary px-3 py-1 w-max rounded-full shadow-sm"
                      >
                        {activeCamp.badge}
                      </motion.span>
                    )}
                    <motion.h1
                      variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                      className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight"
                    >
                      {activeCamp.name.split(" ")[0]} <br />
                      <em>{activeCamp.name.split(" ").slice(1).join(" ")}</em>
                    </motion.h1>
                    <motion.p
                      variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                      className="text-sm font-medium leading-relaxed text-white/95 max-w-md"
                    >
                      {activeCamp.promotional_copy}
                    </motion.p>
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      className="mt-2"
                    >
                      <Link href={`/campaigns/${activeCamp.slug}`}>
                        <Button className="bg-white text-black hover:bg-neutral-100 uppercase tracking-widest text-xs font-semibold px-8 py-6 border-none shadow-lg transition-transform duration-300 hover:scale-105">
                          {activeCamp.cta_text || "Shop Collection"}
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Slider Navigation Arrows (Visible on Hover) */}
            {campaigns.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 bg-black/10 hover:bg-black/30 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs focus:outline-none"
                  aria-label="Previous Campaign slide"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 bg-black/10 hover:bg-black/30 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs focus:outline-none"
                  aria-label="Next Campaign slide"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Slider Dot Indicators */}
            {campaigns.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {campaigns.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { stopSlideTimer(); setActiveSlide(idx); }}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      activeSlide === idx ? "w-8 bg-white" : "w-1.5 bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 2. EDITORIAL BRAND STORY (Scroll reveal) */}
          <ScrollReveal className="py-24 bg-white border-b border-neutral-100">
            <div className="mx-auto max-w-4xl px-4 text-center flex flex-col gap-6 select-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                ATELIER PHILOSOPHY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                Designed with restraint. <br />
                Crafted to last.
              </h2>
              <div className="h-[1px] w-16 bg-neutral-800 mx-auto my-2" />
              <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                We believe in simplifying the modern wardrobe. Every garment is designed with clean geometries, 
                neutral color values, and sourced from natural materials. By concentrating on premium craftsmanship 
                and raw fabrics, we build pieces that withstand seasons.
              </p>
            </div>
          </ScrollReveal>

          {/* 3. NEW ARRIVALS (Scroll reveal & Skeletons support) */}
          <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="flex items-end justify-between mb-12">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  SEASONAL ARRIVALS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  New Arrivals
                </h2>
              </div>
              <Link href="/products" className="text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4">
                View all collection →
              </Link>
            </ScrollReveal>

            {isLoading ? (
              /* Shimmer Skeletons */
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 select-none">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col gap-4 p-3 border border-neutral-100 rounded-sm">
                    <div className="relative aspect-[3/4] w-full bg-neutral-100 rounded-sm overflow-hidden animate-pulse">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-3 w-1/3 bg-neutral-100 rounded-sm animate-pulse" />
                      <div className="h-4 w-3/4 bg-neutral-150 rounded-sm animate-pulse" />
                      <div className="h-3.5 w-1/4 bg-neutral-100 rounded-sm animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ScrollReveal delay={0.15}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {newArrivals.slice(0, 8).map(mapProduct).map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </ScrollReveal>
            )}
          </section>

          {/* 4. SHOP BY CATEGORY SPOTLIGHTS (Scroll reveal) */}
          <section className="pb-24 border-b border-neutral-100 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="flex flex-col gap-2 mb-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SHOP CATALOG</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Featured Categories</h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 select-none">
                {/* Category 1 */}
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 group rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
                    alt="Men"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
                  <div className="absolute bottom-6 left-6 z-20 text-white flex flex-col gap-1">
                    <h3 className="font-serif text-lg font-bold tracking-tight">MEN</h3>
                    <Link href="/products?category=men" className="text-[8px] font-bold uppercase tracking-widest hover:underline mt-0.5">
                      Shop Collection →
                    </Link>
                  </div>
                </div>

                {/* Category 2 */}
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 group rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"
                    alt="Women"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
                  <div className="absolute bottom-6 left-6 z-20 text-white flex flex-col gap-1">
                    <h3 className="font-serif text-lg font-bold tracking-tight">WOMEN</h3>
                    <Link href="/products?category=women" className="text-[8px] font-bold uppercase tracking-widest hover:underline mt-0.5">
                      Shop Collection →
                    </Link>
                  </div>
                </div>

                {/* Category 3 */}
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 group rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
                    alt="Accessories"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
                  <div className="absolute bottom-6 left-6 z-20 text-white flex flex-col gap-1">
                    <h3 className="font-serif text-lg font-bold tracking-tight">ACCESSORIES</h3>
                    <Link href="/products?category=accessories" className="text-[8px] font-bold uppercase tracking-widest hover:underline mt-0.5">
                      Shop Accessories →
                    </Link>
                  </div>
                </div>

                {/* Category 4 */}
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 group rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"
                    alt="Shoes"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
                  <div className="absolute bottom-6 left-6 z-20 text-white flex flex-col gap-1">
                    <h3 className="font-serif text-lg font-bold tracking-tight">SHOES</h3>
                    <Link href="/products?category=shoes" className="text-[8px] font-bold uppercase tracking-widest hover:underline mt-0.5">
                      Shop Shoes →
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* 5. BEST SELLERS (Scroll reveal & Skeletons support) */}
          {isLoading ? (
            <div className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b border-neutral-100 select-none">
              <div className="h-6 w-1/4 bg-neutral-100 rounded-sm mx-auto mb-10 animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col gap-4 p-3 border border-neutral-100 rounded-sm">
                    <div className="relative aspect-[3/4] w-full bg-neutral-100 rounded-sm overflow-hidden animate-pulse">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-3 w-1/3 bg-neutral-100 rounded-sm animate-pulse" />
                      <div className="h-4 w-3/4 bg-neutral-150 rounded-sm animate-pulse" />
                      <div className="h-3.5 w-1/4 bg-neutral-100 rounded-sm animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : bestSellers.length > 0 && (
            <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
              <ScrollReveal className="flex flex-col gap-2 mb-12 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">STORE HIGHLIGHTS</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Best Sellers</h2>
                <div className="h-[1px] w-12 bg-neutral-800 mx-auto my-2" />
              </ScrollReveal>
              
              <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {bestSellers.slice(0, 4).map(mapProduct).map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </ScrollReveal>
            </section>
          )}

          {/* 6. STYLE GALLERY (Scroll reveal) */}
          {gallery.length > 0 && (
            <section className="py-24 bg-neutral-50/50 border-b border-neutral-100">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ScrollReveal className="flex flex-col gap-2 mb-12 text-center select-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SHARE YOUR STYLE</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Instagram Style Gallery</h2>
                  <p className="text-xs text-neutral-500 mt-2 font-medium">Tag @AtelierPremium on social media to be featured in our lookbook.</p>
                  <div className="h-[1px] w-12 bg-neutral-800 mx-auto my-2" />
                </ScrollReveal>

                <ScrollReveal delay={0.15}>
                  <InstagramGallery gallery={gallery} />
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* 7. CUSTOMER REVIEWS (Scroll reveal) */}
          {reviews.length > 0 && (
            <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b border-neutral-100 select-none">
              <ScrollReveal className="flex flex-col gap-2 mb-12 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">REAL FEEDBACK</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Customer Favorites</h2>
                <div className="h-[1px] w-12 bg-neutral-800 mx-auto my-2" />
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="border border-neutral-100 bg-white p-8 rounded-sm shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                      <div>
                        <div className="flex gap-1 text-amber-500 mb-4 text-sm">
                          {Array.from({ length: r.rating }).map((_, idx) => (
                            <span key={idx}>★</span>
                          ))}
                        </div>
                        <h4 className="font-serif text-md font-bold text-neutral-900 mb-2">"{r.title}"</h4>
                        <p className="text-xs text-neutral-600 leading-relaxed italic">"{r.content}"</p>
                      </div>
                      {r.product && (
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-400 mt-6 font-bold">
                          Verified Purchase of {r.product.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </section>
          )}



        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}
