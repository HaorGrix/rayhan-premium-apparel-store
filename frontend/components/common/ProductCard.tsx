"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/features/cart/CartContext";
import { QuickViewModal } from "./QuickViewModal";
import { Button } from "../ui/button";

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
  variant_id?: string | null;
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  navy: "#000080",
  charcoal: "#36454F",
  oatmeal: "#E8DCC4",
  espresso: "#3D2B1F",
  "off-white": "#F8F6F0",
  sage: "#9FAF90",
  rust: "#B7410E",
  olive: "#556B2F",
  camel: "#C19A6B",
  cream: "#FFFDD0",
  indigo: "#4B0082"
};

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  images?: Image[];
  variants?: Variant[];
  average_rating?: number;
  reviews_count?: number;
  isAvailable?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  brand,
  price,
  discountPrice,
  imageUrl,
  images = [],
  variants = [],
  average_rating,
  reviews_count,
  isAvailable = true,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, setIsDrawerOpen, setSelectedVariantIds } = useCart();
  const wishlisted = isInWishlist(id);

  // States
  const [selectedColor, setSelectedColor] = useState("");
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  // Resolve Images
  const galleryImages = images.length > 0 
    ? images 
    : [{ id: "temp", image_url: imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", sort_order: 1 }];

  // Deduplicate colors
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  
  // Set initial selected color on load if not set
  const activeColor = selectedColor || (colors.length > 0 ? colors[0] : "");

  // Find images matching active color
  const activeColorVariantIds = variants
    .filter(v => v.color === activeColor)
    .map(v => v.id);

  let colorMatches = galleryImages.filter(img => 
    img.variant_id && activeColorVariantIds.includes(img.variant_id)
  );

  // Fallback to default images if no color-specific images are found
  if (colorMatches.length === 0) {
    colorMatches = galleryImages.filter(img => !img.variant_id);
  }

  // Final fallback to all images if no images have null variant_id
  if (colorMatches.length === 0) {
    colorMatches = galleryImages;
  }

  const frontImage = colorMatches[0]?.image_url || galleryImages[0]?.image_url;
  const backImage = colorMatches[1]?.image_url || colorMatches[0]?.image_url || galleryImages[0]?.image_url;

  // Calculate discount percentage
  const discountPercent = discountPrice && price > 0
    ? Math.round((1 - (discountPrice / price)) * 100)
    : 0;

  // Star ratings fallback
  const rating = average_rating || 4.7;
  const reviewsCount = reviews_count || 124;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select first available variant matching active color
    const availVariant = variants.find(
      (v) => (v.color === activeColor || !activeColor) && v.stock > 0
    ) || variants.find((v) => v.stock > 0) || variants[0];

    if (!availVariant) return;

    setIsAdding(true);
    try {
      await addToCart(availVariant.id, 1);
      setSelectedVariantIds([availVariant.id]); // Default only select added variant
      setSuccessFlash(true);
      setIsDrawerOpen(true); // Open slide drawer on success
      setTimeout(() => setSuccessFlash(false), 2000);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || "Out of stock";
      alert(`Failed to add to cart: ${errorMsg}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowSizeSelector(false); }}
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col gap-3 bg-white p-3 border border-neutral-100 rounded-sm select-none"
      >
        {/* Product Image Wrapper */}
        <Link 
          href={`/products/${slug}${activeColor ? `?color=${encodeURIComponent(activeColor)}` : ""}`} 
          className="relative block w-full overflow-hidden bg-neutral-50 aspect-[3/4]"
        >
          {/* Double Image Hover Transition with zoom */}
          <div className="relative h-full w-full overflow-hidden">
            <motion.img
              key={`front-${frontImage}`}
              src={frontImage}
              alt={`${name} front view`}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 0 : 1
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover object-center z-0"
            />
            <motion.img
              key={`back-${backImage}`}
              src={backImage}
              alt={`${name} back view`}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover object-center z-10"
            />
          </div>
          {/* Subtle light overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-300 pointer-events-none z-15" />

          {/* Badges */}
          {/* Top Left: Discount */}
          {discountPercent > 0 && (
            <span className="absolute left-3 top-3 z-20 bg-red-600 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase rounded-sm shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {/* Top Right: Wishlist (with subtle click pop) */}
          <motion.button
            onClick={handleWishlistToggle}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm transition-shadow focus:outline-none"
          >
            <svg
              className={`h-4.5 w-4.5 transition-colors duration-300 ${
                wishlisted ? "fill-red-500 stroke-red-500 text-red-500" : "text-neutral-400 stroke-neutral-400 hover:stroke-neutral-800"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>

          {!isAvailable && (
            <span className="absolute bottom-3 left-3 z-20 bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}

          {/* Hover Quick Action Slide-up Bar */}
          <AnimatePresence mode="wait">
            {isHovered && isAvailable && (
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 bottom-0 z-20 hidden md:flex h-12 bg-white/95 backdrop-blur-xs border-t border-neutral-100 select-none text-[9px] font-bold uppercase tracking-widest"
              >
                {!showSizeSelector ? (
                  <div className="flex h-full w-full divide-x divide-neutral-200">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSizeSelector(true);
                      }}
                      disabled={isAdding}
                      className="flex-grow flex items-center justify-center gap-1.5 hover:bg-black hover:text-white transition-colors duration-250 disabled:opacity-50 text-neutral-800 focus:outline-none"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {isAdding ? "Adding..." : successFlash ? "✓ Added" : "Quick Add"}
                    </button>
                    <button
                      onClick={handleQuickView}
                      className="px-4.5 flex items-center justify-center gap-1.5 hover:bg-black hover:text-white transition-colors duration-250 text-neutral-800 focus:outline-none"
                      title="Quick View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 gap-1 bg-white">
                    <span className="text-[8px] font-bold text-neutral-400 mr-1 uppercase">Size:</span>
                    {variants
                      .filter((v) => !activeColor || v.color === activeColor)
                      .map((v) => (
                        <button
                          key={v.id}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (v.stock <= 0) return;
                            
                            setIsAdding(true);
                            try {
                              await addToCart(v.id, 1);
                              setSelectedVariantIds([v.id]); // Default only select added variant
                              setSuccessFlash(true);
                              setIsDrawerOpen(true);
                              setTimeout(() => setSuccessFlash(false), 2000);
                            } catch (err: any) {
                              alert(`Failed to add: ${err.message}`);
                            } finally {
                              setIsAdding(false);
                              setShowSizeSelector(false);
                            }
                          }}
                          disabled={v.stock <= 0}
                          className={cn(
                            "h-7 px-1.5 flex items-center justify-center text-[9px] font-bold border rounded-sm transition-all focus:outline-none",
                            v.stock > 0
                              ? "border-neutral-200 text-neutral-800 hover:border-black hover:bg-black hover:text-white"
                              : "border-neutral-100 text-neutral-300 bg-neutral-50 cursor-not-allowed line-through"
                          )}
                        >
                          {v.size}
                        </button>
                      ))}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSizeSelector(false);
                      }}
                      className="ml-auto text-[9px] text-neutral-400 hover:text-black font-semibold uppercase px-1"
                    >
                      Back
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Mobile-only Direct Add to Cart Button */}
        <div className="md:hidden">
          {!showSizeSelector ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSizeSelector(true);
              }}
              disabled={!isAvailable || isAdding}
              isLoading={isAdding}
              className="w-full text-[10px] font-bold tracking-widest uppercase h-9 bg-black text-white hover:bg-black/90 border-none shadow-sm rounded-sm"
            >
              {successFlash ? "✓ Added" : "Quick Add"}
            </Button>
          ) : (
            <div className="flex flex-wrap gap-1 items-center justify-center p-1 bg-neutral-50 rounded-sm border border-neutral-200">
              {variants
                .filter((v) => !activeColor || v.color === activeColor)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (v.stock <= 0) return;
                      
                      setIsAdding(true);
                      try {
                        await addToCart(v.id, 1);
                        setSelectedVariantIds([v.id]); // Default only select added variant
                        setSuccessFlash(true);
                        setIsDrawerOpen(true);
                        setTimeout(() => setSuccessFlash(false), 2000);
                      } catch (err: any) {
                        alert(`Failed: ${err.message}`);
                      } finally {
                        setIsAdding(false);
                        setShowSizeSelector(false);
                      }
                    }}
                    disabled={v.stock <= 0}
                    className={cn(
                      "h-7 px-2 flex items-center justify-center text-[9px] font-bold border rounded-sm transition-all focus:outline-none bg-white",
                      v.stock > 0
                        ? "border-neutral-200 text-neutral-800 active:bg-black active:text-white"
                        : "border-neutral-100 text-neutral-300 bg-neutral-50 cursor-not-allowed line-through"
                    )}
                  >
                    {v.size}
                  </button>
                ))}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSizeSelector(false);
                }}
                className="text-[9px] text-neutral-400 font-bold px-1.5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Info Layout */}
        <div className="flex flex-col gap-1.5 text-left">
          {/* Reviews Rating Display */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
            <span className="text-amber-500">★</span>
            <span>{rating}</span>
            <span className="text-muted-foreground font-normal">({reviewsCount})</span>
          </div>

          {/* Brand */}
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
            {brand}
          </span>

          {/* Product Name */}
          <Link 
            href={`/products/${slug}${activeColor ? `?color=${encodeURIComponent(activeColor)}` : ""}`} 
            className="focus:outline-none"
          >
            <h3 className="text-xs font-semibold text-neutral-800 hover:text-black line-clamp-1 hover:underline underline-offset-2">
              {name}
            </h3>
          </Link>

          {/* Color swatches preview */}
          {colors.length > 1 && (
            <div className="flex gap-1.5 py-0.5">
              {colors.map((color) => {
                const lowerC = color.toLowerCase();
                const colorHex = COLOR_MAP[lowerC] || "#d1d5db";
                return (
                  <motion.button
                    key={color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-3 w-3 rounded-full border border-black/10 transition-shadow ${
                      activeColor === color ? "scale-110 ring-1 ring-black ring-offset-1" : ""
                    }`}
                    style={{ backgroundColor: colorHex }}
                    aria-label={`View ${color} swatch`}
                  />
                );
              })}
            </div>
          )}

          {/* Price & Free Shipping badge */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-2">
              {discountPrice ? (
                <>
                  <span className="text-xs font-bold text-red-600">
                    {formatCurrency(discountPrice)}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatCurrency(price)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {formatCurrency(price)}
                </span>
              )}
            </div>

            {price >= 100 && (
              <span className="text-[8px] font-bold text-green-700 bg-green-50 px-1 py-0.5 uppercase tracking-wide rounded-sm">
                Free Shipping
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal Overlay */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={{
          id,
          name,
          slug,
          description: name,
          brand,
          price,
          discount_price: discountPrice,
          images: galleryImages,
          variants,
          average_rating: rating,
          reviews_count: reviewsCount,
        }}
      />
    </>
  );
}

export default ProductCard;
