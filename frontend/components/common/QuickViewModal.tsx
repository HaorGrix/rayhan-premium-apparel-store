"use client";

import React, { useState, useEffect } from "react";
import { ColorSwatch } from "./ColorSwatch";
import { SizeSelector } from "./SizeSelector";
import { Button } from "../ui/button";
import { ProductGallery } from "./ProductGallery";
import { useCart } from "@/features/cart/CartContext";
import { formatCurrency } from "@/lib/utils";

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

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  brand?: { name: string } | string;
  category?: { name: string } | string;
  images: Image[];
  variants: Variant[];
  average_rating?: number;
  reviews_count?: number;
}

interface QuickViewModalProps {
  product: ProductDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Sync initial variant choices on open
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const firstAvail = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedColor(firstAvail.color);
      setSelectedSize(firstAvail.size);
      setCartError(null);
      setCartSuccess(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Variant resolution
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const sizesForColor = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => ({ size: v.size, stock: v.stock }));

  const activeVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const activePrice = activeVariant?.price_override 
    ? Number(activeVariant.price_override) 
    : Number(product.price);
  
  const discountPrice = product.discount_price ? Number(product.discount_price) : undefined;
  const inStock = activeVariant ? activeVariant.stock > 0 : false;
  const rating = product.average_rating || 4.7;
  const reviewsCount = product.reviews_count || 124;

  const handleAddToCart = async () => {
    if (!activeVariant) return;
    setIsAdding(true);
    setCartError(null);
    setCartSuccess(false);
    try {
      await addToCart(activeVariant.id, 1);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: any) {
      setCartError(err.message || "Failed to add item to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto rounded-sm">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Gallery */}
        <div className="w-full md:w-1/2">
          <ProductGallery images={product.images} />
        </div>

        {/* Right: Variant Selectors & Description */}
        <div className="w-full md:w-1/2 flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {typeof product.brand === "string" ? product.brand : product.brand?.name || "Atelier"}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              {product.name}
            </h2>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 select-none">
            <div className="flex text-amber-500 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.floor(rating) ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="text-xs font-semibold text-foreground">
              {rating} <span className="text-muted-foreground font-normal">({reviewsCount} reviews)</span>
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3 select-none">
            {discountPrice ? (
              <>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(discountPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(activePrice)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(activePrice)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
              {product.short_description}
            </p>
          )}

          <hr className="border-secondary" />

          {/* Colors Selection Swatches */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Color: <span className="text-foreground capitalize">{selectedColor}</span>
            </span>
            <div className="flex gap-2">
              {uniqueColors.map((color) => {
                const isColorAvailable = product.variants.some((v) => v.color === color && v.stock > 0);
                return (
                  <ColorSwatch
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    isAvailable={isColorAvailable}
                    onClick={() => {
                      setSelectedColor(color);
                      const firstAvail = product.variants.find((v) => v.color === color && v.stock > 0);
                      if (firstAvail) setSelectedSize(firstAvail.size);
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Sizes Selection Box */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Size: <span className="text-foreground">{selectedSize}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map(({ size, stock }) => (
                <SizeSelector
                  key={size}
                  size={size}
                  isSelected={selectedSize === size}
                  isAvailable={stock > 0}
                  onClick={() => setSelectedSize(size)}
                />
              ))}
            </div>
          </div>

          {/* Cart Status Triggers */}
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              isLoading={isAdding}
              className="w-full uppercase tracking-widest font-semibold text-xs h-11"
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            
            {cartError && <p className="text-[10px] text-red-500 font-semibold">{cartError}</p>}
            {cartSuccess && <p className="text-[10px] text-green-600 font-semibold">✓ Added to your cart!</p>}
          </div>

        </div>

      </div>
    </div>
  );
}
export default QuickViewModal;
