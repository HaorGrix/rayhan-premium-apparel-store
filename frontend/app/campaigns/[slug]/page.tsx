"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { apiFetch, ApiError } from "@/lib/api";
import { CampaignShowcase } from "@/components/campaign/CampaignShowcase";
import { CartProvider } from "@/features/cart/CartContext";

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

interface ProductListResponse {
  products: ProductData[];
  total: number;
  skip: number;
  limit: number;
}

function CampaignPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [relatedCampaign, setRelatedCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaignData() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch campaign details
        const campaignData = await apiFetch<CampaignDetails>(`/campaigns/${slug}`);
        setCampaign(campaignData);
        
        // 2. Fetch products in the campaign's collection
        if (campaignData.collection_id) {
          const productRes = await apiFetch<ProductListResponse>(
            `/products?collection_id=${campaignData.collection_id}&limit=12`
          );
          setProducts(productRes.products);
        }

        // 3. Fetch active campaigns to find context-aware related campaign
        try {
          const allCampaigns = await apiFetch<CampaignDetails[]>("/campaigns/active");
          const getRelated = (currentSlug: string, list: CampaignDetails[]) => {
            const relationMap: Record<string, string> = {
              "holiday-collection": "winter-collection-camp",
              "winter-collection-camp": "holiday-collection",
              "summer-campaign": "new-season",
              "new-season": "summer-campaign",
              "weekend-sale": "limited-edition-camp",
              "limited-edition-camp": "weekend-sale"
            };
            const targetSlug = relationMap[currentSlug];
            if (targetSlug) {
              const found = list.find(c => c.slug === targetSlug);
              if (found) return found;
            }
            // Fallback to any campaign that is not the current one
            return list.find(c => c.slug !== currentSlug) || null;
          };
          const related = getRelated(campaignData.slug, allCampaigns);
          setRelatedCampaign(related);
        } catch (cErr) {
          console.warn("Failed to fetch related campaigns:", cErr);
        }
      } catch (err: unknown) {
        console.error("Failed to load campaign:", err);
        const apiErr = err as ApiError;
        setError(apiErr.message || "Failed to load campaign.");
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadCampaignData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center select-none bg-white text-neutral-900">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
          Loading Campaign Showcase...
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center select-none p-6 bg-white text-neutral-900">
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-4 uppercase text-neutral-900">Campaign Not Found</h2>
        <p className="text-sm text-neutral-500 font-light max-w-md text-center mb-8">
          The editorial campaign you are looking for does not exist or has ended.
        </p>
        <button 
          onClick={() => router.push("/products")}
          className="h-12 px-8 flex items-center justify-center text-xs font-bold tracking-widest uppercase border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors rounded-sm cursor-pointer"
        >
          View Collection
        </button>
      </div>
    );
  }

  return <CampaignShowcase campaign={campaign} products={products} relatedCampaign={relatedCampaign} />;
}

export default function CampaignPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white text-neutral-900">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white text-neutral-900">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
                Initializing...
              </div>
            </div>
          }>
            <CampaignPageContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
