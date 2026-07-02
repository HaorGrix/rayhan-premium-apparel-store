"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function CartDrawer() {
  const { 
    cart, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    updateQuantity, 
    removeFromCart, 
    addToCart,
    selectedVariantIds,
    setSelectedVariantIds,
    isLoading 
  } = useCart();
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Coupon / Discount states
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Recommendations empty-state states
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [selectedSuggestionVariants, setSelectedSuggestionVariants] = useState<Record<string, string>>({});
  const [optionsProductId, setOptionsProductId] = useState<string | null>(null);
  const [selSize, setSelSize] = useState<string>("");
  const [selColor, setSelColor] = useState<string>("");

  const openOptions = (p: any) => {
    setOptionsProductId(p.id);
    const sizes = Array.from(new Set(p.variants?.map((v: any) => v.size) || [])) as string[];
    const colors = Array.from(new Set(p.variants?.map((v: any) => v.color).filter(Boolean) || [])) as string[];
    setSelSize(sizes[0] || "");
    setSelColor(colors[0] || "");
  };

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, setIsDrawerOpen]);

  const items = cart?.items || [];
  
  // Calculate checked items and totals
  const checkedItems = items.filter(item => selectedVariantIds.includes(item.variant_id));
  const subtotal = checkedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const totalItems = checkedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping progress calculation based on subtotal of checked items
  const FREE_SHIPPING_THRESHOLD = 150;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  // Recalculate or reset coupon when items in cart change
  useEffect(() => {
    if (couponSuccess && checkedItems.length > 0) {
      const recalculateDiscount = async () => {
        try {
          const res = await apiFetch<any>("/checkout/calculate", {
            method: "POST",
            body: JSON.stringify({
              coupon_code: couponCode.trim(),
              items: checkedItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity
              }))
            })
          });
          setDiscountAmount(Number(res.discount_amount));
        } catch {
          setDiscountAmount(0);
          setCouponSuccess(null);
          setCouponError("Coupon reset due to cart update.");
        }
      };
      recalculateDiscount();
    } else if (checkedItems.length === 0) {
      setDiscountAmount(0);
      setCouponSuccess(null);
      setCouponError(null);
    }
  }, [items, couponSuccess, selectedVariantIds]);

  // Fetch suggestions for empty state recommendations
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await apiFetch<any>("/products?limit=3");
        if (res && res.products) {
          setSuggestedProducts(res.products);
        }
      } catch (e) {
        console.warn("Failed to fetch suggestions for empty cart drawer:", e);
      }
    }
    fetchSuggestions();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCode.trim()) return;
    if (checkedItems.length === 0) {
      setCouponError("Please select at least one item first.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await apiFetch<any>("/checkout/calculate", {
        method: "POST",
        body: JSON.stringify({
          coupon_code: couponCode.trim(),
          items: checkedItems.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity
          }))
        })
      });
      setDiscountAmount(Number(res.discount_amount));
      setCouponSuccess("Applied successfully!");
    } catch (err: any) {
      setDiscountAmount(0);
      setCouponError(err.message || "Invalid coupon or minimum value not met.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckoutRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    setIsCheckingOut(true);
    try {
      // 1. Find unselected items
      const unselectedItems = items.filter(item => !selectedVariantIds.includes(item.variant_id));
      
      // 2. Save them to local storage
      if (unselectedItems.length > 0) {
        localStorage.setItem(
          "saved_cart_items", 
          JSON.stringify(unselectedItems.map(i => ({ variant_id: i.variant_id, quantity: i.quantity })))
        );
        
        // 3. Remove them from the database cart before checkout
        for (const item of unselectedItems) {
          await removeFromCart(item.id);
        }
      }
      
      setIsDrawerOpen(false);
      router.push(`/checkout?coupon_code=${encodeURIComponent(couponCode)}`);
    } catch (err) {
      console.error("Failed to prepare cart for checkout:", err);
      alert("Something went wrong preparing checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-neutral-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 select-none">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-neutral-800" />
                <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900">
                  Shopping Bag
                </h2>
                {totalItems > 0 && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
              {/* Shipping threshold progress bar */}
              {items.length > 0 && (
                <div className="mb-6 rounded-md bg-neutral-50 p-4 border border-neutral-100/50 select-none">
                  <div className="mb-2 text-xs font-medium text-neutral-700 text-left">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-semibold">🎉 You qualify for Free Shipping!</span>
                    ) : (
                      <span>
                        Spend <strong className="text-black">{formatCurrency(amountToFreeShipping)}</strong> more to get <strong>Free Standard Shipping</strong>
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full transition-colors ${
                        isFreeShipping ? "bg-emerald-600" : "bg-neutral-800"
                      }`}
                    />
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                  <span className="mt-4 text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
                    Refreshing bag...
                  </span>
                </div>
              ) : items.length === 0 ? (
                /* Empty state */
                <div className="flex h-full flex-col justify-between py-4">
                  <div className="flex flex-col items-center justify-center text-center select-none py-10">
                    <div className="mb-4 rounded-full bg-neutral-50 p-4">
                      <ShoppingBag className="h-10 w-10 text-neutral-400 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-neutral-900">Your bag is empty</h3>
                    <p className="mt-1 max-w-[240px] text-xs text-neutral-500 leading-relaxed">
                      Refined staples, tailored trousers, and premium boots await your curated wardrobe.
                    </p>
                    <Button
                      onClick={() => setIsDrawerOpen(false)}
                      className="mt-6 uppercase text-[10px] tracking-widest font-bold px-8 py-5 h-auto bg-black text-white hover:bg-neutral-800 rounded-sm"
                    >
                      Continue Shopping
                    </Button>
                  </div>

                  {/* Empty state suggestions */}
                  {suggestedProducts.length > 0 && (
                    <div className="border-t border-neutral-150/60 pt-6 mt-auto">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 text-left">
                        Trending Additions
                      </h4>
                      <div className="flex flex-col gap-3">
                        {suggestedProducts.map((p) => {
                          const firstImage = p.images?.[0]?.image_url 
                            ? (p.images[0].image_url.startsWith("http") 
                               ? p.images[0].image_url 
                               : `http://localhost:8000${p.images[0].image_url}`)
                            : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300";
                            
                          const isOptionOpen = optionsProductId === p.id;

                          if (isOptionOpen) {
                            const uniqueSizes = Array.from(new Set(p.variants?.map((v: any) => v.size) || [])) as string[];
                            const uniqueColors = Array.from(new Set(p.variants?.map((v: any) => v.color).filter(Boolean) || [])) as string[];
                            
                            const brandName = p.brand?.name || "ZARA";
                            const ratingVal = ((p.name.charCodeAt(0) + p.name.charCodeAt(1)) % 10) / 10 + 4.1;
                            const ratingNum = ratingVal.toFixed(1);
                            const ratingCount = (p.name.length * 3) + 12;

                            return (
                              <div key={p.id} className="flex flex-col border border-neutral-200 bg-white p-3.5 rounded-sm shadow-xs transition-all text-left">
                                {/* Row 1: Size selector & Back */}
                                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Size:</span>
                                    <div className="flex gap-1">
                                      {uniqueSizes.map((sz) => (
                                        <button
                                          key={sz}
                                          type="button"
                                          onClick={() => setSelSize(sz)}
                                          className={`px-2 py-0.5 text-[9px] font-bold border rounded-xs transition-colors uppercase ${selSize === sz ? "bg-black text-white border-black" : "bg-white text-neutral-600 border-neutral-200 hover:border-black"}`}
                                        >
                                          {sz}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setOptionsProductId(null)}
                                    className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 hover:text-black"
                                  >
                                    Back
                                  </button>
                                </div>

                                {/* Row 2: Star rating & Brand */}
                                <div className="flex items-center gap-1 text-[9px] select-none text-neutral-400">
                                  <span className="text-amber-500 text-[10px]">★</span>
                                  <span className="text-black font-bold">{ratingNum}</span>
                                  <span>({ratingCount})</span>
                                </div>
                                <div className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mt-1 select-none">
                                  {brandName}
                                </div>

                                {/* Row 3: Product Name */}
                                <h5 className="text-[11px] font-serif font-bold text-neutral-900 mt-0.5 leading-snug">{p.name}</h5>

                                {/* Row 4: Color circles */}
                                {uniqueColors.length > 0 && (
                                  <div className="flex gap-1.5 items-center mt-2 mb-2 select-none">
                                    {uniqueColors.map((col) => {
                                      const colorMap: Record<string, string> = {
                                        "olive": "#556B2F",
                                        "olive green": "#556B2F",
                                        "purple": "#800080",
                                        "navy": "#000080",
                                        "navy blue": "#000080",
                                        "blue": "#0000FF",
                                        "red": "#FF0000",
                                        "black": "#000000",
                                        "white": "#FFFFFF",
                                        "charcoal": "#36454F",
                                        "grey": "#808080",
                                        "indigo": "#4B0082",
                                        "sand": "#C2B280",
                                        "beige": "#F5F5DC"
                                      };
                                      const cssColor = colorMap[col.toLowerCase()] || col.toLowerCase();
                                      const isSelected = selColor === col;
                                      return (
                                        <button
                                          key={col}
                                          type="button"
                                          onClick={() => setSelColor(col)}
                                          style={{ backgroundColor: cssColor }}
                                          className={`w-3.5 h-3.5 rounded-full border transition-all ${isSelected ? "ring-1 ring-offset-1 ring-black border-black" : "border-neutral-300 hover:border-black"}`}
                                          title={col}
                                        />
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Row 5: Price, Free shipping badge & Confirm Add */}
                                <div className="flex justify-between items-center border-t border-neutral-100 pt-2 mt-2">
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-1.5">
                                      {p.discount_price ? (
                                        <>
                                          <span className="text-[11px] font-bold text-black">{formatCurrency(Number(p.discount_price))}</span>
                                          <span className="text-[9px] text-neutral-400 line-through">{formatCurrency(Number(p.price))}</span>
                                        </>
                                      ) : (
                                        <span className="text-[11px] font-bold text-neutral-900">{formatCurrency(Number(p.price))}</span>
                                      )}
                                    </div>
                                    <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded-xs mt-0.5 uppercase tracking-wider">Free Shipping</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const variant = p.variants?.find((v: any) => v.size === selSize && (!selColor || v.color === selColor));
                                      if (!variant || variant.stock <= 0) {
                                        alert("Selected variant combination is out of stock or unavailable.");
                                        return;
                                      }
                                      try {
                                        await addToCart(variant.id, 1);
                                        setSelectedVariantIds([variant.id]); 
                                        setOptionsProductId(null);
                                      } catch (err) {
                                        alert("Could not add suggestion.");
                                      }
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-wider bg-black hover:bg-neutral-800 text-white px-3 py-2 rounded-sm transition-colors cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={p.id} className="flex gap-3 items-center border border-neutral-100 bg-neutral-50/50 p-2.5 rounded-sm">
                              <Link 
                                href={`/products/${p.slug}`} 
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex gap-3 items-center flex-grow group cursor-pointer"
                              >
                                <div className="h-14 w-11 flex-shrink-0 overflow-hidden bg-neutral-100 rounded-sm border border-neutral-200/50 group-hover:border-neutral-800 transition-colors">
                                  <img src={firstImage} alt={p.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-grow text-left flex flex-col gap-0.5">
                                  <h5 className="text-[11px] font-bold text-neutral-800 line-clamp-1 group-hover:text-black transition-colors">{p.name}</h5>
                                  
                                  {/* Price with potential discount */}
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {p.discount_price ? (
                                      <>
                                        <span className="text-[10px] font-bold text-black">{formatCurrency(Number(p.discount_price))}</span>
                                        <span className="text-[8px] text-neutral-400 line-through">{formatCurrency(Number(p.price))}</span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] font-bold text-neutral-900">{formatCurrency(Number(p.price))}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>

                              <button
                                onClick={() => openOptions(p)}
                                disabled={p.variants?.every((v: any) => v.stock <= 0)}
                                className="text-[9px] font-bold uppercase tracking-wider bg-black hover:bg-neutral-800 text-white px-3 py-2 rounded-sm disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Items list */
                <motion.div 
                  layout
                  className="flex flex-col gap-5"
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 items-center border-b border-neutral-100 pb-5"
                      >
                        {/* Checkout selection checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.includes(item.variant_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVariantIds(prev => [...prev, item.variant_id]);
                            } else {
                              setSelectedVariantIds(prev => prev.filter(id => id !== item.variant_id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black flex-shrink-0"
                          aria-label={`Select ${item.name} for checkout`}
                        />

                        {/* Image wrapper */}
                        <div className="h-24 w-18 flex-shrink-0 overflow-hidden bg-neutral-100 border border-neutral-200/50 rounded-sm">
                          <img
                            src={item.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between py-0.5">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-xs font-semibold text-neutral-900 hover:underline text-left line-clamp-1">
                              <Link href={`/products/${item.sku.split("-")[0]}`} onClick={() => setIsDrawerOpen(false)}>
                                {item.name}
                              </Link>
                            </h4>
                            {item.color || item.size ? (
                              <p className="text-[10px] text-neutral-500 font-medium text-left">
                                {item.color && <span>{item.color}</span>}
                                {item.color && item.size && <span className="mx-1.5">•</span>}
                                {item.size && <span>Size {item.size}</span>}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-neutral-200 rounded-sm bg-neutral-50">
                              <button
                                onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-neutral-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price and Delete button */}
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-neutral-900">
                                {formatCurrency(Number(item.price) * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer Summary (Sticky at bottom) */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 bg-neutral-50/80 backdrop-blur-md px-6 py-5 select-none">
                
                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full border border-neutral-250 px-3 py-2 text-[10px] uppercase font-bold focus:outline-none focus:border-black rounded-sm bg-white"
                  />
                  <button 
                    type="submit" 
                    disabled={isApplyingCoupon}
                    className="bg-black hover:bg-neutral-800 text-white text-[9px] font-bold px-4 rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {couponError && <p className="text-[9px] text-red-600 font-bold mb-3 text-left">{couponError}</p>}
                {couponSuccess && <p className="text-[9px] text-emerald-700 font-bold mb-3 text-left">{couponSuccess}</p>}

                <div className="flex flex-col gap-1.5 mb-2.5 text-xs font-semibold text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                    <span className="text-neutral-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({couponCode.toUpperCase()})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-800 font-bold text-sm border-t border-neutral-200/50 pt-2.5">
                    <span>Estimated Total</span>
                    <span className="text-neutral-900 text-base">{formatCurrency(Math.max(0, subtotal - discountAmount))}</span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 leading-normal mb-4">
                  Shipping, taxes, and discounts calculated at checkout.
                </p>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleCheckoutRedirect}
                    disabled={isCheckingOut || checkedItems.length === 0}
                    className="w-full uppercase text-xs tracking-widest font-bold h-12 bg-black hover:bg-neutral-800 text-white rounded-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    Proceed to Checkout ({checkedItems.length})
                  </Button>
                  <Link href="/cart" onClick={() => setIsDrawerOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full uppercase text-xs tracking-widest font-semibold h-12 border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-sm flex items-center justify-center gap-1">
                      View Shopping Bag
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
