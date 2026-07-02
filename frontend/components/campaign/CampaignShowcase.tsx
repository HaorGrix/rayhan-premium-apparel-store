"use client";

import React from "react";
import Link from "next/link";
import { ProductCard } from "../common/ProductCard";

interface CampaignDetails {
  id: string;
  name: string;
  slug: string;
  description?: string;
  desktop_banner_url: string;
  mobile_banner_url: string;
  collection_id?: string;
  cta_text?: string;
  cta_link?: string;
  badge?: string;
  promotional_copy?: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  brand?: { name: string };
  price: number;
  discount_price?: number;
  images: { id: string; image_url: string; sort_order: number }[];
  variants: { id: string; sku: string; color: string; size: string; stock: number; price_override?: number | null }[];
  average_rating?: number;
  reviews_count?: number;
}

interface CampaignShowcaseProps {
  campaign: CampaignDetails;
  products: ProductData[];
  relatedCampaign?: CampaignDetails | null;
}

export function CampaignShowcase({ campaign, products, relatedCampaign }: CampaignShowcaseProps) {
  // Extract lookbook lifestyle images from products or fallback
  const lookbookImages = products.slice(4, 8).map(p => p.images[0]?.image_url).filter(Boolean);
  const fallbackImages = [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"
  ];

  while (lookbookImages.length < 3) {
    lookbookImages.push(fallbackImages[lookbookImages.length % fallbackImages.length]);
  }

  // Split title into first word and remaining italicized words
  const titleWords = campaign.name.split(" ");
  const firstWord = titleWords[0];
  const italicizedPart = titleWords.slice(1).join(" ");

  return (
    <div className="w-full bg-white text-neutral-900 font-sans">
      {/* 1. Static Premium Editorial Hero Section (Matches Homepage Hero Style) */}
      <section className="relative w-full h-[80vh] bg-neutral-900 overflow-hidden flex items-center">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/25 z-10" />

        {/* Background Hero Banner */}
        <div className="absolute inset-0 z-0">
          <img 
            src={campaign.desktop_banner_url} 
            alt={campaign.name} 
            loading="eager"
            className="w-full h-full object-cover object-center" 
          />
        </div>

        {/* Left-Aligned Transparent Typography Overlaid Directly */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-left">
          <div className="max-w-xl flex flex-col gap-6 text-white drop-shadow-sm select-none">
            {campaign.badge && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground bg-primary px-3 py-1 w-max rounded-full shadow-sm">
                {campaign.badge}
              </span>
            )}
            
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              {firstWord} <br />
              <em className="font-serif italic font-medium">{italicizedPart}</em>
            </h1>

            {campaign.promotional_copy && (
              <p className="text-sm font-medium leading-relaxed text-white/95 max-w-md">
                {campaign.promotional_copy}
              </p>
            )}

            <div className="mt-2">
              <Link href={campaign.cta_link || `/products?collection=${campaign.slug}`}>
                <button className="bg-white text-black hover:bg-neutral-100 uppercase tracking-widest text-xs font-semibold px-8 py-4 border-none shadow-lg transition-transform duration-300 hover:scale-105 rounded-sm cursor-pointer">
                  {campaign.cta_text || "Shop Collection"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Campaign Story Section */}
      <section className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            THE EDITORIAL STORY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 uppercase">
            {campaign.description ? campaign.description : `Introducing ${campaign.name}`}
          </h2>
          <p className="text-sm md:text-base font-light text-neutral-600 leading-relaxed max-w-3xl">
            This collection represents a deep exploration of form, fabric, and functional detailing. Crafted using strictly certified organic resources and custom structured blends, each piece is engineered for daily focus and refined longevity. By prioritizing premium weights and sustainable craftsmanship, we build garments that act as a clean canvas for your signature expression.
          </p>
        </div>
      </section>

      {/* 3. Featured Collection Shopping Grid */}
      {products.length > 0 && (
        <section className="relative bg-[#fafafa] py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex flex-row items-end justify-between mb-2 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  EXPLORE LOOKBOOK
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Featured Pieces
                </h3>
              </div>
              <Link 
                href={`/products?collection=${campaign.slug}`} 
                className="text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4 text-neutral-900"
              >
                View All Products →
              </Link>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              {products.slice(0, 8).map((p) => (
                <div key={p.id} className="text-neutral-900">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    brand={p.brand?.name || "Atelier"}
                    price={p.price}
                    discountPrice={p.discount_price}
                    images={p.images}
                    variants={p.variants}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Luxury Editorial Lookbook Gallery */}
      <section className="relative bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-2 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              LOOKBOOK FOCUS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Staggered Silhouettes
            </h3>
          </div>

          {/* Staggered double-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="w-full aspect-[4/5] overflow-hidden rounded-sm border border-neutral-100 shadow-md">
                <img src={lookbookImages[0]} alt="Lookbook 01" loading="lazy" className="w-full h-full object-cover object-center hover:scale-103 transition-transform duration-700" />
              </div>
              <div className="max-w-md text-left flex flex-col gap-4">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400">DESIGN PHILOSOPHY</span>
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  Focusing on structured shoulders, customized natural shell buttons, and heavy double-stitched seams, this edit merges absolute utilitarian comfort with classical tailored elegance.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8 md:mt-24">
              <div className="w-full aspect-[4/5] overflow-hidden rounded-sm border border-neutral-100 shadow-md">
                <img src={lookbookImages[1] || lookbookImages[0]} alt="Lookbook 02" loading="lazy" className="w-full h-full object-cover object-center hover:scale-103 transition-transform duration-700" />
              </div>
              <div className="w-full aspect-[3/2] overflow-hidden rounded-sm border border-neutral-100 shadow-md">
                <img src={lookbookImages[2] || lookbookImages[0]} alt="Lookbook 03" loading="lazy" className="w-full h-full object-cover object-center hover:scale-103 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 5. Minimalist Curated Related Campaign CTA (Plain background, no image banner) */}
      {relatedCampaign && (
        <section className="relative bg-[#fafafa] py-32 border-t border-neutral-100 text-center select-none">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 px-4 sm:px-6 lg:px-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400 block mb-2">
              NEXT EDITORIAL
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 uppercase leading-none">
              {relatedCampaign.name.split(" ")[0]} <br />
              <em className="font-serif italic font-medium">{relatedCampaign.name.split(" ").slice(1).join(" ")}</em>
            </h2>
            <Link href={`/campaigns/${relatedCampaign.slug}`}>
              <button className="mt-4 bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-widest text-xs font-semibold px-8 py-4 border-none shadow-lg transition-transform duration-300 hover:scale-105 rounded-sm cursor-pointer">
                Explore Campaign
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
