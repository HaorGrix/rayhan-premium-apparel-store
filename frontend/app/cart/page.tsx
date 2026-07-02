"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  ChevronRight,
  Sparkles,
  Check
} from "lucide-react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { CartProvider } from "@/features/cart/CartContext";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  brand?: { name: string };
  price: number;
  discount_price?: number;
  images: { id: string; image_url: string; sort_order: number }[];
  variants: { id: string; sku: string; color: string; size: string; stock: number; price_override?: number | null }[];
}

function CartPageContent() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    addToCart, 
    selectedVariantIds, 
    setSelectedVariantIds, 
    isLoading 
  } = useCart();
  
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  
  // Custom states
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [undoItem, setUndoItem] = useState<{ variantId: string; quantity: number; name: string } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductData[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [addingRecId, setAddingRecId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  // Load recommended products on mount
  useEffect(() => {
    async function loadRecommendations() {
      try {
        setIsRecommendationsLoading(true);
        const res = await apiFetch<{ products: ProductData[] }>("/products?limit=6");
        if (res && res.products) {
          setRecommendedProducts(res.products);
        }
      } catch (err) {
        console.error("Failed to load recommended products:", err);
      } finally {
        setIsRecommendationsLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center select-none">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-center uppercase text-xs tracking-widest text-muted-foreground animate-pulse">
          Loading Shopping Cart...
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  
  // Calculate Totals based only on checked items
  const checkedItems = items.filter(item => selectedVariantIds.includes(item.variant_id));
  const subtotal = checkedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  
  // Dynamic Shipping Fee based on method
  let shipping = 0;
  if (subtotal > 0) {
    if (shippingMethod === "standard") {
      shipping = subtotal >= 150 ? 0 : 15;
    } else if (shippingMethod === "express") {
      shipping = 25;
    } else if (shippingMethod === "pickup") {
      shipping = 0;
    }
  }

  const tax = (subtotal - discountAmount) > 0 ? (subtotal - discountAmount) * 0.05 : 0; // 5% VAT
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  // Dynamic Free Shipping Progress Calculations
  const freeShippingThreshold = 150;
  const amountNeeded = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Dynamic delivery date estimate helper
  const getDeliveryEstimate = () => {
    if (subtotal === 0) return "--";
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const today = new Date();
    
    let minDays = 3;
    let maxDays = 6;
    
    if (shippingMethod === "express") {
      minDays = 1;
      maxDays = 2;
    } else if (shippingMethod === "pickup") {
      return "Ready for pickup in 2-4 hours";
    }
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);
    
    return `${minDate.toLocaleDateString("en-US", options)} – ${maxDate.toLocaleDateString("en-US", options)}`;
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCode.trim()) return;
    if (checkedItems.length === 0) {
      setCouponError("Please select at least one item first.");
      return;
    }

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
      setCouponSuccess(`Applied successfully!`);
    } catch (err: any) {
      setDiscountAmount(0);
      setCouponError(err.message || "Invalid coupon code or minimum purchase value not met.");
    }
  };

  const handleIncrement = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    } else {
      const target = items.find(i => i.id === itemId);
      if (target) {
        handleRemoveItem(target.id, target.name, target.variant_id, target.quantity);
      }
    }
  };

  const handleRemoveItem = async (itemId: string, name: string, variantId: string, quantity: number) => {
    try {
      setUndoItem({ variantId, quantity, name });
      await removeFromCart(itemId);
      setShowUndo(true);
      setTimeout(() => {
        setShowUndo(false);
      }, 6000);
    } catch (e) {
      console.error("Failed to remove item:", e);
    }
  };

  const handleUndoRemove = async () => {
    if (!undoItem) return;
    try {
      await addToCart(undoItem.variantId, undoItem.quantity);
      setSelectedVariantIds(prev => [...prev, undoItem.variantId]); // Re-select
      setUndoItem(null);
      setShowUndo(false);
    } catch (e) {
      console.error("Failed to undo remove:", e);
    }
  };

  const handleAddRecommended = async (prod: ProductData) => {
    const activeColor = prod.variants?.[0]?.color || "";
    const firstVariant = prod.variants?.find(v => v.stock > 0) || prod.variants?.[0];
    if (!firstVariant) return;

    setAddingRecId(prod.id);
    try {
      await addToCart(firstVariant.id, 1);
      setSelectedVariantIds([firstVariant.id]); // Automatically select only newly added suggestion
    } catch (err: any) {
      alert(`Could not add recommendation: ${err.message}`);
    } finally {
      setAddingRecId(null);
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
      const unselectedItems = items.filter(item => !selectedVariantIds.includes(item.variant_id));
      if (unselectedItems.length > 0) {
        localStorage.setItem(
          "saved_cart_items", 
          JSON.stringify(unselectedItems.map(i => ({ variant_id: i.variant_id, quantity: i.quantity })))
        );
        for (const item of unselectedItems) {
          await removeFromCart(item.id);
        }
      }
      router.push(`/checkout?coupon_code=${encodeURIComponent(couponCode)}`);
    } catch (err) {
      console.error("Failed to prepare checkout:", err);
      alert("Something went wrong preparing checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="py-8 select-none">
      
      {/* Undo Alert Banner */}
      <AnimatePresence>
        {showUndo && undoItem && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-neutral-900 text-white px-4 py-3.5 flex justify-between items-center text-xs font-semibold uppercase tracking-wider rounded-sm shadow-lg border border-neutral-800"
          >
            <span>Removed "{undoItem.name}" from your bag.</span>
            <button 
              onClick={handleUndoRemove}
              className="text-primary hover:text-white transition-colors underline focus:outline-none"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Items & Details */}
        <div className="w-full lg:flex-grow flex flex-col gap-6">
          
          {/* Shipping Progress bar */}
          <div className="bg-white border border-border p-5 rounded-sm select-none">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Shipping Benefit
            </h2>
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Check className="w-4.5 h-4.5" />
                <span>Congratulations! You unlocked FREE SHIPPING.</span>
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-700 font-medium">
                  You are only <strong className="text-black">{formatCurrency(amountNeeded)}</strong> away from unlocking <strong>Free Standard Shipping</strong>.
                </p>
                <div className="mt-3 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-black h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="text-center py-20 bg-white border border-border rounded-sm flex flex-col items-center justify-center gap-4">
                <ShoppingBag className="w-10 h-10 text-neutral-300 stroke-[1.5]" />
                <h3 className="font-serif text-lg font-bold">Your shopping cart is empty</h3>
                <Link href="/products">
                  <Button className="uppercase text-xs tracking-widest font-bold px-8 bg-black hover:bg-neutral-800">
                    Discover Products
                  </Button>
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const isLowStock = item.stock !== undefined && item.stock <= 5;
                const isInStock = item.stock !== undefined && item.stock > 0;
                
                return (
                  <motion.div 
                    key={item.id} 
                    layout 
                    exit={{ opacity: 0, x: -100 }}
                    className="group flex flex-col sm:flex-row gap-5 p-5 border border-border bg-white rounded-sm hover:border-foreground/20 hover:shadow-md transition-all duration-300 relative items-center"
                  >
                    {/* Item Checkbox */}
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
                      className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black flex-shrink-0"
                      aria-label={`Select ${item.name} for checkout`}
                    />
                    
                    {/* Item Thumbnail */}
                    <div className="w-full sm:w-28 h-40 flex-shrink-0 overflow-hidden bg-secondary border border-border rounded-sm relative group-hover:scale-[1.01] transition-transform duration-300">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2 pr-4 text-left">{item.name}</h3>
                          
                          {/* Rich Variant Info Grid */}
                          <div className="mt-2 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                            {item.color && (
                              <span className="flex gap-1">
                                <span className="font-semibold text-foreground/75">Color:</span> {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="flex gap-1">
                                <span className="font-semibold text-foreground/75">Size:</span> {item.size}
                              </span>
                            )}
                            {item.material && (
                              <span className="flex gap-1">
                                <span className="font-semibold text-foreground/75">Material:</span> {item.material}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-muted mt-1 font-mono uppercase tracking-tight text-left">SKU: {item.sku}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(item.price))}
                          </span>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="mt-4 flex items-center justify-between border-t border-secondary/50 pt-4">
                        <div className="flex items-center gap-6">
                          {/* Stock Badges */}
                          {isLowStock ? (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                              Low Stock ({item.stock} left)
                            </span>
                          ) : isInStock ? (
                            <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Adjust qty & Remove */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-neutral-350 rounded-sm bg-neutral-50/50">
                            <button
                              onClick={() => handleDecrement(item.id, item.quantity)}
                              className="px-2 py-1 text-muted hover:text-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold font-mono text-neutral-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item.id, item.quantity)}
                              className="px-2 py-1 text-muted hover:text-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id, item.name, item.variant_id, item.quantity)}
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors focus:outline-none"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Order Summary Panel */}
        {items.length > 0 && (
          <div className="w-full lg:w-96 border border-border bg-white p-6 rounded-sm select-none">
            <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900 border-b border-border pb-4">
              Order Summary
            </h2>
            
            {/* Calculation details list */}
            <div className="mt-5 flex flex-col gap-3.5 border-b border-border pb-5 text-xs font-semibold text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal ({checkedItems.length} {checkedItems.length === 1 ? "item" : "items"})</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-foreground">{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5% VAT)</span>
                <span className="text-foreground">{formatCurrency(tax)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 bg-red-50/50 p-2 rounded-xs">
                  <span>Promo Code Discount ({couponCode.toUpperCase()})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between items-end">
              <span className="text-xs font-bold text-neutral-500 uppercase">Estimated Total</span>
              <span className="text-2xl font-bold text-foreground tracking-tight font-serif">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Promo Code Inline Form */}
            <form onSubmit={handleApplyCoupon} className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
              <label htmlFor="coupon" className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono text-left">
                Discount Promo Code
              </label>
              <div className="flex border border-border overflow-hidden focus-within:border-black transition-colors rounded-none bg-white">
                <input
                  type="text"
                  id="coupon"
                  placeholder="ENTER CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="px-3 py-3 text-xs w-full focus:outline-none uppercase font-bold placeholder-neutral-400"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 text-xs font-bold hover:bg-primary/90 transition-all rounded-none hover:cursor-pointer"
                >
                  APPLY
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-bold text-left">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-700 font-bold text-left">{couponSuccess}</p>}
            </form>

            <Button 
              onClick={handleCheckoutRedirect}
              disabled={isCheckingOut || checkedItems.length === 0}
              className="w-full mt-4 uppercase tracking-widest font-bold py-6 text-xs rounded-none group hover:scale-[1.01] active:scale-[0.99] transition-all hover:cursor-pointer disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
              ) : (
                <>
                  Proceed to Checkout ({checkedItems.length})
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="mt-4 border-t border-border pt-4 text-muted flex flex-col gap-3 font-semibold select-none">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-wider font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Encrypted Pay</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Recommended Upsells Section */}
      {recommendedProducts.length > 0 && (
        <section className="mt-20 border-t border-border pt-16">
          <div className="flex flex-col gap-2 mb-10 select-none text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Complete the Look</span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">Recommended Additions</h2>
          </div>

          {isRecommendationsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-60 bg-neutral-100 rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendedProducts.slice(0, 3).map((prod) => {
                const firstImage = prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800";
                const isAddingRec = addingRecId === prod.id;
                
                return (
                  <div key={prod.id} className="border border-border p-4 bg-white hover:shadow-md transition-shadow duration-300 flex flex-col justify-between rounded-sm">
                    <div>
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 rounded-sm mb-4">
                        <img
                          src={firstImage}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-800 line-clamp-1 hover:underline text-left">
                        <Link href={`/products/${prod.slug}`}>{prod.name}</Link>
                      </h4>
                      <p className="text-[11px] font-bold text-neutral-900 mt-1 text-left">
                        {formatCurrency(Number(prod.price))}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleAddRecommended(prod)}
                      disabled={isAddingRec}
                      className="w-full mt-4 text-[10px] uppercase font-bold tracking-wider bg-black hover:bg-neutral-800 border-none rounded-none py-4"
                    >
                      {isAddingRec ? "Adding..." : "Add to Bag"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted py-6 select-none">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-foreground">Shopping Bag</span>
          </div>
          
          <CartPageContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
