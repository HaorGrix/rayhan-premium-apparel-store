"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductGallery } from "@/components/common/ProductGallery";
import { ColorSwatch } from "@/components/common/ColorSwatch";
import { SizeSelector } from "@/components/common/SizeSelector";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { useCart } from "@/features/cart/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { CartProvider } from "@/features/cart/CartContext";
import { Breadcrumb, BreadcrumbItem } from "@/components/common/Breadcrumb";
import { STYLE_REGISTRY } from "@/config/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductReviews } from "@/components/common/ProductReviews";
import { ProductCard } from "@/components/common/ProductCard";
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Link2 
} from "lucide-react";

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

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  brand?: { name: string; slug?: string };
  category?: { name: string; slug?: string };
  images: Image[];
  variants: Variant[];
}

interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  images: Image[];
  variants: Variant[];
}

const PRODUCT_FEATURES: Record<string, string[]> = {
  "minimalist-cotton-tshirt": [
    "100% Certified Organic Cotton",
    "Lightweight & Highly Breathable (180 GSM)",
    "Modern Relaxed Silhouette",
    "Ribbed Crewneck Collar",
    "Pre-shrunk & Machine Washable",
  ],
  "premium-wool-blazer": [
    "Structured Wool-Blend Composition",
    "Double Vent Back & Chest Welt Pocket",
    "Soft Internal Lining with Pockets",
    "Contrast Tortoise Shell Buttons",
    "Professional Dry Clean Only",
  ],
  "tailored-linen-trousers": [
    "100% Pure Organic Linen",
    "Ultra-Lightweight & Breathable Weave",
    "Wide-Leg Cut with Pressed Creases",
    "Concealed Hook-and-Eye Fastening",
    "Easy-Iron & Cool Handwash",
  ],
  "leather-chelsea-boots": [
    "Genuine Handcrafted Calf Leather",
    "Elasticated Gussets & Double Pull-Tabs",
    "Cushioned Ortholite® Footbed",
    "Durable Stacked Rubber Sole",
    "Water & Stain Resistant Finish",
  ],
};

function ProductDetailContent() {
  const { id_or_slug } = useParams();
  const searchParams = useSearchParams();
  const { addToCart, setIsDrawerOpen, setSelectedVariantIds } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; parent_id?: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  // UI state
  const [openAccordions, setOpenAccordions] = useState<string[]>(["details"]);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetails[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiFetch<ProductDetails>(`/products/${id_or_slug}`);
        setProduct(data);
        
        // Auto-select first available color/size or pre-selected color from query param
        if (data.variants && data.variants.length > 0) {
          const queryColor = searchParams.get("color");
          let matchedVariant = null;
          if (queryColor) {
            matchedVariant = data.variants.find(v => v.color.toLowerCase() === queryColor.toLowerCase() && v.stock > 0)
              || data.variants.find(v => v.color.toLowerCase() === queryColor.toLowerCase());
          }
          const availableVariant = matchedVariant || data.variants.find(v => v.stock > 0) || data.variants[0];
          setSelectedColor(availableVariant.color);
          setSelectedSize(availableVariant.size);
        }
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        setError(apiErr.message || "Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id_or_slug) loadProduct();
  }, [id_or_slug, searchParams]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Auto-select first available size for the new color
    if (product?.variants) {
      const availSizeForColor = product.variants.find(v => v.color === color && v.stock > 0)
        || product.variants.find(v => v.color === color);
      if (availSizeForColor) {
        setSelectedSize(availSizeForColor.size);
      }
    }
    
    // Update URL query param in place without full page reload
    const params = new URLSearchParams(window.location.search);
    params.set("color", color);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  // Load categories for full hierarchy breadcrumbs
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await apiFetch<any[]>("/categories");
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories for breadcrumbs:", err);
      }
    }
    loadCategories();
  }, []);

  // Load related products
  useEffect(() => {
    async function loadRelated() {
      if (!product) return;
      try {
        const catId = typeof product.category === "string" 
          ? product.category 
          : product.category?.slug || "";
        
        const url = catId 
          ? `/products?category=${catId}&limit=5` 
          : `/products?limit=5`;
        
        const response = await apiFetch<unknown>(url);
        const items = (response as { products?: ProductDetails[] })?.products || (response as ProductDetails[]);
        if (Array.isArray(items)) {
          setRelatedProducts(items.filter((p) => p.id !== product.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load related products", err);
      }
    }
    loadRelated();
  }, [product]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem("recently_viewed");
      let list: RecentlyViewedItem[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored) as RecentlyViewedItem[];
        } catch {
          list = [];
        }
      }
      
      // Exclude current, then prepend current view
      list = list.filter(item => item.id !== product.id);
      const viewItem: RecentlyViewedItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand?.name || "Atelier",
        price: product.price,
        discountPrice: product.discount_price,
        imageUrl: product.images[0]?.image_url,
        images: product.images,
        variants: product.variants
      };
      list.unshift(viewItem);
      list = list.slice(0, 5); // Limit stored items
      localStorage.setItem("recently_viewed", JSON.stringify(list));
    }
  }, [product]);

  // Retrieve recently viewed list from localStorage on mount/product change
  useEffect(() => {
    const stored = localStorage.getItem("recently_viewed");
    if (stored && product) {
      setTimeout(() => {
        try {
          const list = JSON.parse(stored) as RecentlyViewedItem[];
          setRecentlyViewed(list.filter((item) => item.id !== product.id).slice(0, 4));
        } catch {
          setRecentlyViewed([]);
        }
      }, 0);
    }
  }, [product]);

  // Listen to scroll to display sticky footer
  useEffect(() => {
    const handleScroll = () => {
      const mainBtn = document.getElementById("main-add-to-cart");
      if (mainBtn) {
        const rect = mainBtn.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse uppercase text-xs tracking-widest select-none">
        Loading Product Details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center select-none">
        <p className="text-red-500 font-medium mb-4">{error || "Product not found."}</p>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  // Deduplicate colors and sizes from variants
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  
  // Filter sizes based on active color selection
  const sizesForActiveColor = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => ({ size: v.size, stock: v.stock }));

  // Find active variant matching selections
  const activeVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  // Filter product images based on selected color variant
  const colorVariantIds = product.variants
    .filter(v => v.color === selectedColor)
    .map(v => v.id);

  let displayImages = product.images.filter(img => 
    img.variant_id && colorVariantIds.includes(img.variant_id)
  );

  // Fallback to default images if no color-specific images exist
  if (displayImages.length === 0) {
    displayImages = product.images.filter(img => !img.variant_id);
  }

  // Final fallback to all images
  if (displayImages.length === 0) {
    displayImages = product.images;
  }

  // Variant override or base price
  const activePrice = activeVariant?.price_override 
    ? Number(activeVariant.price_override) 
    : Number(product.price);
  
  const discountPrice = product.discount_price ? Number(product.discount_price) : undefined;
  const inStock = activeVariant ? activeVariant.stock > 0 : false;
  const lowStock = activeVariant ? activeVariant.stock > 0 && activeVariant.stock < 5 : false;

  const handleAddToCart = async () => {
    if (!activeVariant) return;
    setIsAdding(true);
    setCartError(null);
    setCartSuccess(false);
    try {
      await addToCart(activeVariant.id, quantity);
      setSelectedVariantIds([activeVariant.id]); // Only select the added variant
      setCartSuccess(true);
      setIsDrawerOpen(true); // Open the cart drawer
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setCartError(apiErr.message || "Could not add item to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleAccordion = (id: string) => {
    if (openAccordions.includes(id)) {
      setOpenAccordions(openAccordions.filter(a => a !== id));
    } else {
      setOpenAccordions([...openAccordions, id]);
    }
  };

  const handleIncrement = () => {
    if (activeVariant && quantity < activeVariant.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getDeliveryDates = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 4);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${minDate.toLocaleDateString("en-US", options)} – ${maxDate.toLocaleDateString("en-US", options)}`;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Shop", href: "/products" },
  ];

  if (product.category) {
    const currentCatSlug = typeof product.category === "string" 
      ? product.category 
      : product.category.slug || "";
    
    const catObj = categories.find(c => c.slug === currentCatSlug || c.id === currentCatSlug);
    if (catObj) {
      if (catObj.parent_id) {
        const parentObj = categories.find(c => c.id === catObj.parent_id);
        if (parentObj) {
          breadcrumbItems.push({
            label: parentObj.name,
            href: `/products?category=${parentObj.slug}`
          });
        }
      }
      breadcrumbItems.push({
        label: catObj.name,
        href: `/products?category=${catObj.slug}`
      });

      // Dynamic style breadcrumb matching from registry
      const matchedStyle = Object.values(STYLE_REGISTRY).find(style => {
        const isParentMatch = style.parentCategorySlug.split(",").includes(currentCatSlug);
        if (!isParentMatch) return false;
        return product.name.toLowerCase().includes(style.filterKeyword.toLowerCase());
      });

      if (matchedStyle) {
        breadcrumbItems.push({
          label: matchedStyle.label,
          href: `/products?category=${catObj.slug}&style=${matchedStyle.slug}`
        });
      }
    } else {
      breadcrumbItems.push({ 
        label: typeof product.category === "string" ? product.category : product.category?.name || "Apparel", 
        href: `/products?category=${currentCatSlug}` 
      });
    }
  }

  breadcrumbItems.push({ label: product.name });

  return (
    <div className="flex flex-col">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-8">
        {/* 1. Left Column: Product Gallery */}
        <div>
          <ProductGallery images={displayImages} slug={product.slug} />
        </div>

        {/* 2. Right Column: Variant & Add to Cart Forms with Premium Spacing */}
        <div className="flex flex-col gap-8">
          
          {/* Brand & Name & Rating */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 select-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                {product.brand?.name || "Atelier"}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Interactive Rating Header */}
            <div 
              onClick={() => {
                document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none hover:opacity-80 transition-opacity w-fit"
            >
              <div className="flex text-amber-500 font-serif text-sm">★★★★★</div>
              <span className="text-foreground">4.8</span>
              <span className="text-muted-foreground/80">(142 Reviews)</span>
            </div>
          </div>

          {/* Pricing & Estimated Delivery */}
          <div className="flex flex-col gap-3.5 border-y border-secondary/50 py-4 select-none">
            <div className="flex items-center gap-3">
              {discountPrice ? (
                <>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(discountPrice)}
                  </span>
                  <span className="text-base text-muted-foreground line-through font-medium">
                    {formatCurrency(activePrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(activePrice)}
                </span>
              )}
            </div>

            {/* Delivery Estimate */}
            <div className="text-xs text-muted-foreground/90 font-medium">
              Order Today to receive by: <span className="text-foreground font-bold">{getDeliveryDates()}</span>
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm text-muted-foreground/90 leading-relaxed -mt-2">
              {product.short_description}
            </p>
          )}

          {/* Colors Select Swatch */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      handleColorChange(color);
                      setQuantity(1);
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Sizes Select Box with Recommendation */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <span>Size: <span className="text-foreground">{selectedSize}</span></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesForActiveColor.map(({ size, stock }) => (
                <SizeSelector
                  key={size}
                  size={size}
                  isSelected={selectedSize === size}
                  isAvailable={stock > 0}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                />
              ))}
            </div>

            {/* Model Reference & Find My Size */}
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>
                Model is 183 cm wearing size <strong className="text-foreground font-semibold">M</strong>
              </span>
              <span className="underline hover:text-foreground cursor-pointer font-bold uppercase tracking-wider text-[9px] transition-colors">
                Find My Size
              </span>
            </div>
          </div>

          {/* Stock status indicator */}
          <div className="select-none text-xs font-medium -mt-2">
            {activeVariant ? (
              inStock ? (
                lowStock ? (
                  <span className="text-amber-600 font-semibold">Only {activeVariant.stock} left in stock — order soon</span>
                ) : (
                  <span className="text-green-600 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> In Stock — Ready to Ship (Usually ships within 24h)
                  </span>
                )
              ) : (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              )
            ) : (
              <span className="text-muted-foreground">Select color and size</span>
            )}
          </div>

          {/* Quantity Selector, Purchase Action & Wishlist Button */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4" id="main-add-to-cart">
              {/* Quantity Incrementor */}
              <div className="flex items-center border border-secondary h-[56px] select-none justify-between sm:justify-start">
                <button 
                  type="button" 
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || !inStock}
                  className="px-4 py-2 hover:bg-secondary/20 font-bold transition-colors disabled:opacity-30 h-full flex items-center"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs">{quantity}</span>
                <button 
                  type="button" 
                  onClick={handleIncrement}
                  disabled={!inStock || (activeVariant ? quantity >= activeVariant.stock : true)}
                  className="px-4 py-2 hover:bg-secondary/20 font-bold transition-colors disabled:opacity-30 h-full flex items-center"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                isLoading={isAdding}
                className="flex-grow h-[56px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 shadow-sm hover:shadow-md hover:bg-foreground/90"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            {/* Wishlist & Share Row */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold border border-secondary py-3 px-4 hover:border-foreground hover:bg-secondary/10 transition-all duration-200"
              >
                <Heart className={cn("h-4 w-4 transition-colors duration-200", wishlisted ? "fill-red-500 text-red-500" : "text-foreground")} />
                {wishlisted ? "Saved" : "Wishlist"}
              </button>

              {/* Interactive Share menu */}
              <div className="relative">
                <button
                  onClick={() => setShowShare(!showShare)}
                  className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold border border-secondary py-3 px-4 hover:border-foreground hover:bg-secondary/10 transition-all duration-200 w-full"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                
                {showShare && (
                  <div className="absolute right-0 bottom-full mb-2 bg-background border border-secondary shadow-lg py-2.5 w-48 z-20 flex flex-col text-xs font-semibold select-none animate-fadeIn rounded-sm">
                    <a 
                      href="https://facebook.com" target="_blank" rel="noreferrer"
                      className="px-4 py-2 hover:bg-secondary/20 flex items-center gap-2.5 transition-colors text-foreground"
                    >
                      <svg className="h-3.5 w-3.5 fill-current text-muted-foreground" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg> Facebook
                    </a>
                    <a 
                      href="https://twitter.com" target="_blank" rel="noreferrer"
                      className="px-4 py-2 hover:bg-secondary/20 flex items-center gap-2.5 transition-colors text-foreground"
                    >
                      <svg className="h-3.5 w-3.5 fill-current text-muted-foreground" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter / X
                    </a>
                    <a 
                      href="https://whatsapp.com" target="_blank" rel="noreferrer"
                      className="px-4 py-2 hover:bg-secondary/20 flex items-center gap-2.5 transition-colors text-foreground"
                    >
                      WhatsApp
                    </a>
                    <button 
                      onClick={handleCopyLink}
                      className="px-4 py-2 hover:bg-secondary/20 flex items-center gap-2.5 text-left w-full transition-colors border-t border-secondary mt-1 font-bold text-foreground"
                    >
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" /> {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {cartError && (
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {cartError}
              </p>
            )}
            {cartSuccess && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                ✓ Product added to your cart successfully!
              </p>
            )}
          </div>

          {/* Delivery & Return Badges */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-secondary/50 select-none text-[10px] font-bold uppercase tracking-widest text-muted-foreground/90">
            <div className="flex items-center gap-1.5 justify-center">
              <Truck className="h-4 w-4 text-foreground/80 flex-shrink-0" /> Free Shipping
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <RefreshCw className="h-3.5 w-3.5 text-foreground/80 flex-shrink-0" /> 30-Day Returns
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="h-4 w-4 text-foreground/80 flex-shrink-0" /> Secure Checkout
            </div>
          </div>

          {/* Payment Trust Icons */}
          <div className="flex flex-col items-center gap-2.5 py-1 select-none">
            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/50">Accepted Payments</span>
            <div className="flex gap-4 opacity-55 hover:opacity-85 transition-opacity">
              <svg className="h-5 w-8 border border-secondary/30 rounded-sm" viewBox="0 0 24 15" fill="currentColor"><path d="M12 0H0v15h24V0H12z" fill="#fcfcfc"/><path d="M3.86 11.23L5.4 3.03H7.8l-1.55 8.2H3.86zm7.2-.03L8.68 3.03h2.36l1.24 6 1.05-6H15.7l-2.07 8.17H11.06zm8.17 0c-.3-.88-1.53-2.12-2.1-2.48-.34-.23-.62-.35-.62-.57 0-.3.42-.5 1.07-.5.7 0 1.25.18 1.62.33l.4-2.1c-.55-.17-1.46-.33-2.38-.33-2.48 0-4.04 1.2-4.06 2.94 0 1.3 1.27 2 2.2 2.43.93.44 1.23.72 1.23 1.1-.03.6-.83.85-1.58.85-1.07 0-1.74-.2-2.22-.4l-.45 2.18c.67.28 1.86.53 3.08.53 2.65 0 4.07-1.22 4.2-2.95zm4.77.03h2l-1.75-8.2h-2.16L24 11.2z" fill="#1A1F71"/></svg>
              <svg className="h-5 w-8 border border-secondary/30 rounded-sm" viewBox="0 0 24 15" fill="currentColor"><rect width="24" height="15" rx="2" fill="#222222"/><circle cx="9.5" cy="7.5" r="5" fill="#EB001B" opacity="0.9"/><circle cx="14.5" cy="7.5" r="5" fill="#F79E1B" opacity="0.9"/></svg>
              <svg className="h-5 w-8 border border-secondary/30 rounded-sm" viewBox="0 0 24 15" fill="currentColor"><rect width="24" height="15" rx="2" fill="#016FD0"/><path d="M6.3 3.5h1.2l.9 2.5.9-2.5h1.2v8H9.3V7.2l-1 2.3H7.5l-1-2.3v3.8H5.3v-8zM14.5 3.5h3.5v1.2h-2.3v2h2.1V7.9h-2.1v2.3h2.3v1.3H14.5v-8z" fill="#fff"/></svg>
              <span className="text-[9px] font-bold bg-secondary/80 px-2 py-0.5 rounded border border-secondary/60 flex items-center"> Pay</span>
              <span className="text-[9px] font-bold bg-secondary/80 px-2 py-0.5 rounded border border-secondary/60 flex items-center">G Pay</span>
            </div>
          </div>

          {/* Product Scannable Features List */}
          <div className="flex flex-col gap-3 py-1 select-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Highlights</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-foreground/90">
              {(PRODUCT_FEATURES[product.slug] || [
                "Premium quality construction",
                "Sustainable and ethically sourced",
                "Designed for everyday comfort",
                "Fits true to size",
              ]).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Vertical Accordion Component */}
          <div className="border-t border-secondary mt-2 flex flex-col select-none">
            {/* Accordion 1: Details */}
            <div className="border-b border-secondary">
              <button 
                type="button"
                onClick={() => toggleAccordion("details")}
                className="w-full py-4 flex justify-between items-center text-left text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-85 transition-opacity"
              >
                <span>Details</span>
                {openAccordions.includes("details") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openAccordions.includes("details") && (
                <div className="pb-4 text-xs leading-relaxed text-muted-foreground/90 transition-all duration-200 animate-slideDown">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </div>

            {/* Accordion 2: Fabric & Care */}
            <div className="border-b border-secondary">
              <button 
                type="button"
                onClick={() => toggleAccordion("fabric")}
                className="w-full py-4 flex justify-between items-center text-left text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-85 transition-opacity"
              >
                <span>Fabric & Care</span>
                {openAccordions.includes("fabric") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openAccordions.includes("fabric") && (
                <div className="pb-4 text-xs leading-relaxed text-muted-foreground/90 transition-all duration-200 animate-slideDown">
                  <ul className="list-disc pl-4 flex flex-col gap-2 font-medium">
                    <li>100% premium quality construction material.</li>
                    <li>Sustainably harvested and processed.</li>
                    <li>Machine wash cold with like colors, gentle cycle.</li>
                    <li>Hang dry to preserve fit and appearance or tumble dry low.</li>
                    <li>Iron on low if necessary.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 3: Size Guide */}
            <div className="border-b border-secondary">
              <button 
                type="button"
                onClick={() => toggleAccordion("size-guide")}
                className="w-full py-4 flex justify-between items-center text-left text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-85 transition-opacity"
              >
                <span>Size Guide</span>
                {openAccordions.includes("size-guide") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openAccordions.includes("size-guide") && (
                <div className="pb-4 text-xs leading-relaxed text-muted-foreground/90 transition-all duration-200 animate-slideDown">
                  <table className="w-full text-left border-collapse my-2">
                    <thead>
                      <tr className="border-b border-secondary text-muted-foreground font-bold">
                        <th className="py-1.5">Size</th>
                        <th className="py-1.5">Chest (in)</th>
                        <th className="py-1.5">Waist (in)</th>
                        <th className="py-1.5">Sleeve (in)</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/90 font-medium">
                      <tr className="border-b border-secondary/40"><td className="py-1.5 font-bold">S</td><td className="py-1.5">36 - 38</td><td className="py-1.5">30 - 32</td><td className="py-1.5">33</td></tr>
                      <tr className="border-b border-secondary/40"><td className="py-1.5 font-bold">M</td><td className="py-1.5">38 - 40</td><td className="py-1.5">32 - 34</td><td className="py-1.5">34</td></tr>
                      <tr className="border-b border-secondary/40"><td className="py-1.5 font-bold">L</td><td className="py-1.5">40 - 42</td><td className="py-1.5">34 - 36</td><td className="py-1.5">35</td></tr>
                      <tr className="border-b border-secondary/40"><td className="py-1.5 font-bold">XL</td><td className="py-1.5">42 - 44</td><td className="py-1.5">36 - 38</td><td className="py-1.5">36</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Accordion 4: Delivery & Returns */}
            <div className="border-b border-secondary">
              <button 
                type="button"
                onClick={() => toggleAccordion("delivery")}
                className="w-full py-4 flex justify-between items-center text-left text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-85 transition-opacity"
              >
                <span>Delivery & Returns</span>
                {openAccordions.includes("delivery") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openAccordions.includes("delivery") && (
                <div className="pb-4 text-xs leading-relaxed text-muted-foreground/90 transition-all duration-200 animate-slideDown">
                  <p>
                    We offer complimentary standard shipping on all orders over $150. Delivery times typically range between 3 to 6 business days. Express shipping upgrades are available at checkout.
                  </p>
                  <p className="mt-2">
                    Returns are accepted within 30 days of the delivery date. Items must be returned in their original condition, unworn and unwashed, with all original tags attached.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 5: FAQ */}
            <div className="border-b border-secondary">
              <button 
                type="button"
                onClick={() => toggleAccordion("faq")}
                className="w-full py-4 flex justify-between items-center text-left text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-85 transition-opacity"
              >
                <span>FAQ</span>
                {openAccordions.includes("faq") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openAccordions.includes("faq") && (
                <div className="pb-4 text-xs leading-relaxed text-muted-foreground/90 transition-all duration-200 animate-slideDown flex flex-col gap-3 font-medium">
                  <div>
                    <h5 className="font-bold text-foreground mb-0.5">Is this product pre-shrunk?</h5>
                    <p>Yes, all of our cotton and fabric items are treated and pre-shrunk during production to ensure fit consistency after home laundering.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground mb-0.5">Are returns free?</h5>
                    <p>Yes, we provide pre-paid shipping labels for all domestic returns and exchanges inside the 30-day window.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Add to Cart Footer */}
      {showSticky && product && activeVariant && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-secondary py-3 px-4 shadow-xl z-50 animate-slideUp select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={displayImages[0]?.image_url || product.images[0]?.image_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100"} 
                alt={product.name} 
                className="h-12 w-10 object-cover bg-secondary border border-secondary"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground leading-tight line-clamp-1">{product.name}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                  {selectedColor} / {selectedSize}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(discountPrice || activePrice)}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                isLoading={isAdding}
                className="h-[44px] px-6 uppercase tracking-widest font-bold text-[11px] hover:bg-foreground/90 hover:-translate-y-[1px] transition-all"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Customer Reviews Section */}
      <ProductReviews 
        productId={product.id} 
        productName={product.name} 
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      {/* 4. Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="py-12 border-t border-secondary mt-12 select-none">
          <h3 className="font-serif text-2xl font-bold tracking-tight mb-8">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                brand={p.brand?.name || "Atelier"}
                price={p.price}
                discountPrice={p.discount_price}
                images={p.images}
                variants={p.variants}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="py-12 border-t border-secondary mt-12 select-none">
          <h3 className="font-serif text-2xl font-bold tracking-tight mb-8">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                brand={p.brand || "Atelier"}
                price={p.price}
                discountPrice={p.discountPrice}
                imageUrl={p.imageUrl}
                images={p.images}
                variants={p.variants}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-16">
          <Suspense fallback={<div className="py-20 text-center text-sm text-neutral-500 uppercase tracking-widest">Loading product...</div>}>
            <ProductDetailContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
