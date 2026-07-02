"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { apiFetch } from "@/lib/api";
import { CartProvider } from "@/features/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/common/Breadcrumb";

interface Variant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  price_override?: number | null;
}

interface Image {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: { name: string } | string;
  price: number;
  discount_price?: number;
  images: Image[];
  variants: Variant[];
  average_rating?: number;
  reviews_count?: number;
}

// Fallback products for rendering when backend service is offline
const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Minimalist Cotton T-Shirt",
    slug: "minimalist-cotton-tshirt",
    brand: "COS",
    price: 45.00,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    images: [
      { id: "img1", image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", sort_order: 1 },
      { id: "img2", image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800", sort_order: 2 }
    ],
    variants: [
      { id: "v1", sku: "1", color: "White", size: "S", stock: 10 },
      { id: "v2", sku: "2", color: "White", size: "M", stock: 10 },
      { id: "v3", sku: "3", color: "Black", size: "M", stock: 5 },
      { id: "v4", sku: "4", color: "Brown", size: "L", stock: 8 }
    ],
    average_rating: 4.8,
    reviews_count: 124,
    isAvailable: true
  },
  {
    id: "prod-2",
    name: "Premium Wool Blazer",
    slug: "premium-wool-blazer",
    brand: "Zara",
    price: 189.00,
    discountPrice: 151.20,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    images: [
      { id: "img3", image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", sort_order: 1 },
      { id: "img4", image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800", sort_order: 2 }
    ],
    variants: [
      { id: "v5", sku: "5", color: "Navy", size: "S", stock: 5 },
      { id: "v6", sku: "6", color: "Navy", size: "M", stock: 8 },
      { id: "v7", sku: "7", color: "Charcoal", size: "M", stock: 6 }
    ],
    average_rating: 4.9,
    reviews_count: 86,
    isAvailable: true
  },
  {
    id: "prod-3",
    name: "Tailored Linen Trousers",
    slug: "tailored-linen-trousers",
    brand: "COS",
    price: 89.00,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
    images: [
      { id: "img5", image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800", sort_order: 1 },
      { id: "img6", image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800", sort_order: 2 }
    ],
    variants: [
      { id: "v8", sku: "8", color: "Beige", size: "S", stock: 12 },
      { id: "v9", sku: "9", color: "Beige", size: "M", stock: 10 },
      { id: "v10", sku: "10", color: "Black", size: "M", stock: 7 }
    ],
    average_rating: 4.6,
    reviews_count: 52,
    isAvailable: true
  },
  {
    id: "prod-4",
    name: "Leather Chelsea Boots",
    slug: "leather-chelsea-boots",
    brand: "Zara",
    price: 149.00,
    imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800",
    images: [
      { id: "img7", image_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800", sort_order: 1 },
      { id: "img8", image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800", sort_order: 2 }
    ],
    variants: [
      { id: "v11", sku: "11", color: "Brown", size: "9", stock: 4 },
      { id: "v12", sku: "12", color: "Black", size: "9", stock: 0 }
    ],
    average_rating: 4.7,
    reviews_count: 73,
    isAvailable: true
  }
];

export function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      try {
        setLoading(true);
        // Fetch each product individually using Promise.all with grace fallback to MOCK_PRODUCTS
        const promises = wishlist.map(async (id) => {
          try {
            return await apiFetch<any>(`/products/${id}`);
          } catch (e) {
            console.warn(`Product ${id} not found in database, checking mocks.`);
            const mock = MOCK_PRODUCTS.find(p => p.id === id);
            return mock || null;
          }
        });
        const resolved = await Promise.all(promises);
        setProducts(resolved.filter(Boolean));
      } catch (err) {
        console.warn("Failed to fetch products from backend. Falling back to mocks.");
        const filteredMocks = MOCK_PRODUCTS.filter(p => wishlist.includes(p.id));
        setProducts(filteredMocks);
      } finally {
        setLoading(false);
      }
    }

    if (wishlist.length > 0) {
      loadWishlistProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlist]);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb - Left aligned for layout consistency */}
          <Breadcrumb items={[{ label: "Wishlist" }]} />
          
          {/* Section Header - Left aligned to match products catalog & cart */}
          <div className="flex flex-col gap-2 mb-10 select-none text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Personal Collection
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900">
              My Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2" />
            </div>
          ) : products.length === 0 ? (
            /* Empty state (Centered) */
            <div className="flex flex-col items-center justify-center min-h-[350px] gap-5 select-none text-center">
              <div className="text-muted-foreground/35 mb-2">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs font-serif italic">
                Your wishlist is empty. Discover minimalist designs and curated capsules in our store.
              </p>
              <Link href="/products" className="mt-4">
                <Button className="uppercase tracking-widest text-xs font-semibold px-6 py-5">
                  Explore Catalog
                </Button>
              </Link>
            </div>
          ) : (
            /* Wishlist Products Grid */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 animate-in fade-in duration-300">
              {products.map((product) => {
                const stock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                return (
                  <ProductCard
                    key={product.id}
                    {...product}
                    brand={typeof product.brand === "string" ? product.brand : product.brand?.name || "Atelier"}
                    price={Number(product.price)}
                    discountPrice={product.discount_price ? Number(product.discount_price) : undefined}
                    isAvailable={stock > 0}
                  />
                );
              })}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}

export default WishlistPage;
