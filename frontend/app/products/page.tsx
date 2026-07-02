"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { CartProvider } from "@/features/cart/CartContext";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem } from "@/components/common/Breadcrumb";
import { 
  STYLE_REGISTRY, 
  COMBINED_CATEGORIES, 
  COLLECTIONS_MAP, 
  SIDEBAR_STRUCTURE,
  getStylesForCategory,
  getStyleBySlug,
  getCollectionBySlug,
  getCollectionByDbSlug
} from "@/config/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
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

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Categories/Brands list for filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Products state
  const [products, setProducts] = useState<ProductData[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filters (sync'd to url search params)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [activeBrand, setActiveBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [activeCollection, setActiveCollection] = useState(searchParams.get("collection") || "");
  const [activeDiscount, setActiveDiscount] = useState(searchParams.get("discount") || "");
  const [activeStyle, setActiveStyle] = useState(searchParams.get("style") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "newest");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Sync state with URL params change
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setActiveCategory(searchParams.get("category") || "");
    setActiveBrand(searchParams.get("brand") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setActiveCollection(searchParams.get("collection") || "");
    setActiveDiscount(searchParams.get("discount") || "");
    setActiveStyle(searchParams.get("style") || "");
  }, [searchParams]);

  // Load static category/brand/collection filters on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const cats = await apiFetch<Category[]>("/categories");
        const brs = await apiFetch<Brand[]>("/brands");
        const colls = await apiFetch<{ id: string; name: string; slug: string }[]>("/collections");
        setCategories(cats);
        setBrands(brs);
        setCollections(colls);
      } catch (err) {
        console.error("Failed to load filter taxonomies:", err);
      }
    }
    loadFilterOptions();
  }, []);

  // Fetch products upon filter changes
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        
        // Resolve Category IDs or Slugs
        if (activeCategory) {
          const categoryObj = categories.find(c => c.slug === activeCategory);
          queryParams.set("category_id", categoryObj ? categoryObj.id : activeCategory);
        }
        
        if (activeBrand) {
          const brandObj = brands.find(b => b.slug === activeBrand);
          queryParams.set("brand_id", brandObj ? brandObj.id : activeBrand);
        }
        
        if (minPrice) queryParams.set("min_price", minPrice);
        if (maxPrice) queryParams.set("max_price", maxPrice);
        
        // Resolve Collection mapping dynamically from registry
        if (activeCollection) {
          const mapped = getCollectionBySlug(activeCollection);
          const dbCollectionSlug = mapped ? mapped.dbSlug : activeCollection;
          const collObj = collections.find(c => c.slug === dbCollectionSlug);
          queryParams.set("collection_id", collObj ? collObj.id : dbCollectionSlug);
        }
        
        if (activeDiscount) queryParams.set("on_sale", "true");
        
        // Resolve Style mapping dynamically from registry
        const styleInfo = activeStyle ? getStyleBySlug(activeStyle) : null;
        if (styleInfo) {
          if (!activeCategory) {
            // Find parent subcategory in categories to filter
            const parentCatObj = categories.find(c => c.slug === styleInfo.parentCategorySlug.split(",")[0]);
            queryParams.set("category_id", parentCatObj ? parentCatObj.id : styleInfo.parentCategorySlug);
          }
          // Merge style filter keyword into backend search
          const currentSearch = queryParams.get("search") || "";
          const styleKeyword = styleInfo.filterKeyword;
          queryParams.set("search", currentSearch ? `${styleKeyword} ${currentSearch}` : styleKeyword);
        }

        queryParams.set("skip", String((page - 1) * limit));
        queryParams.set("limit", String(limit));

        const res = await apiFetch<ProductListResponse>(`/products?${queryParams.toString()}`);
        
        let sortedProducts = [...res.products];
        
        if (sortBy === "price_asc") {
          sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "price_desc") {
          sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
        }
        
        setProducts(sortedProducts);
        setTotalProducts(res.total);
      } catch (err: any) {
        setError(err.message || "Failed to load catalog products.");
      } finally {
        setIsLoading(false);
      }
    }

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [search, activeCategory, activeBrand, minPrice, maxPrice, sortBy, page, categories, brands, collections, activeCollection, activeDiscount, activeStyle]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear style param if we are clicking a new base category, unless style is also provided
    if (updates.category !== undefined && updates.style === undefined) {
      params.delete("style");
    }
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setPage(1); // reset to page 1
    router.push(`/products?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSearch("");
    setActiveCategory("");
    setActiveBrand("");
    setMinPrice("");
    setMaxPrice("");
    setActiveCollection("");
    setActiveDiscount("");
    setActiveStyle("");
    router.push("/products");
  };

  const totalPages = Math.ceil(totalProducts / limit);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Shop", href: "/products" }
  ];

  // Resolve active parent category and subcategories
  const activeCategorySlugs = activeCategory ? activeCategory.split(",") : [];
  
  // If style is active, treat its parent category as active too!
  const activeStyleInfo = activeStyle ? getStyleBySlug(activeStyle) : null;
  if (activeStyleInfo) {
    const parentSlugs = activeStyleInfo.parentCategorySlug.split(",");
    parentSlugs.forEach(ps => {
      if (!activeCategorySlugs.includes(ps)) {
        activeCategorySlugs.push(ps);
      }
    });
  }

  // Resolve parent department id (Men/Women/Accessories/Shoes)
  let activeParentId: string | null = null;
  if (activeCategorySlugs.length > 0) {
    const activeCatObjs = categories.filter(c => activeCategorySlugs.includes(c.slug));
    if (activeCatObjs.length > 0) {
      activeParentId = activeCatObjs[0].parent_id || activeCatObjs[0].id;
    }
  }

  // 1. Resolve Breadcrumb for Style
  if (activeStyleInfo) {
    // Add parent department (e.g. Men or Women)
    const parentDeptSlug = activeStyleInfo.parentCategorySlug.split("-")[0];
    const parentDeptObj = categories.find(c => c.slug === parentDeptSlug);
    if (parentDeptObj) {
      breadcrumbItems.push({ 
        label: parentDeptObj.name, 
        href: `/products?category=${parentDeptObj.slug}` 
      });
    }
    // Add subcategory (e.g. Trousers)
    const subcatObj = categories.find(c => c.slug === activeStyleInfo.parentCategorySlug.split(",")[0]);
    if (subcatObj) {
      breadcrumbItems.push({ 
        label: subcatObj.name, 
        href: `/products?category=${subcatObj.slug}` 
      });
    }
    // Add style (e.g. Linen Trousers)
    breadcrumbItems.push({ 
      label: activeStyleInfo.label 
    });
  } else if (activeCategory) {
    // 2. Resolve Breadcrumb for Category
    const combinedInfo = COMBINED_CATEGORIES[activeCategory];
    if (combinedInfo) {
      const parentObj = categories.find(c => c.slug === combinedInfo.parentSlug);
      if (parentObj) {
        breadcrumbItems.push({ 
          label: parentObj.name, 
          href: `/products?category=${parentObj.slug}` 
        });
      }
      breadcrumbItems.push({ 
        label: combinedInfo.label 
      });
    } else {
      if (activeCategory.includes(",")) {
        // Comma separated list (unmapped) - format nicely
        const catNames = activeCategorySlugs.map(slug => {
          const c = categories.find(cat => cat.slug === slug);
          return c ? c.name : slug;
        });
        breadcrumbItems.push({
          label: catNames.join(" & ")
        });
      } else {
        // Single category logic
        const singleCatObj = categories.find(c => c.slug === activeCategory);
        if (singleCatObj) {
          if (singleCatObj.parent_id) {
            const parentObj = categories.find(c => c.id === singleCatObj.parent_id);
            if (parentObj) {
              breadcrumbItems.push({ 
                label: parentObj.name, 
                href: `/products?category=${parentObj.slug}` 
              });
            }
          }
          breadcrumbItems.push({ 
            label: singleCatObj.name 
          });
        } else {
          breadcrumbItems.push({ 
            label: activeCategory 
          });
        }
      }
    }
  }
  
  if (activeBrand) {
    const brandObj = brands.find(b => b.slug === activeBrand);
    breadcrumbItems.push({
      label: brandObj ? brandObj.name : activeBrand.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    });
  }

  if (activeCollection) {
    const collObj = getCollectionBySlug(activeCollection);
    breadcrumbItems.push({
      label: collObj ? collObj.label : activeCollection.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    });
  }
  if (activeDiscount) {
    breadcrumbItems.push({
      label: "On Sale"
    });
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col md:flex-row gap-8 py-4">
      {/* 1. Sidebar Filters */}
      <aside className="w-full md:w-64 flex flex-col gap-6 md:border-r border-border md:pr-8 select-none">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Categories</h3>
          <div className="flex flex-wrap md:flex-col gap-1">
            <button
              onClick={() => updateUrlParams({ category: null })}
              className={cn(
                "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-bold hover:cursor-pointer pl-3 border-l-2",
                activeCategory === "" ? "text-foreground border-primary" : "text-neutral-500 border-transparent"
              )}
            >
              All Categories
            </button>
            
            {/* Dynamic sidebar hierarchy rendering from configuration */}
            {SIDEBAR_STRUCTURE.map((parentSection) => {
              const parentDbObj = categories.find(c => c.slug === parentSection.slug);
              const parentId = parentDbObj ? parentDbObj.id : parentSection.slug;
              const isParentSectionActive = activeParentId === parentId || activeCategory === parentSection.slug;
              
              return (
                <div key={parentSection.slug} className="flex flex-col gap-0.5 mt-2 first:mt-0">
                  <button
                    onClick={() => updateUrlParams({ category: parentSection.slug })}
                    className={cn(
                      "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-bold hover:cursor-pointer uppercase tracking-wider pl-3 border-l-2",
                      (activeCategory === parentSection.slug || activeParentId === parentId) 
                        ? "text-foreground border-primary" 
                        : "text-neutral-800 border-transparent"
                    )}
                  >
                    {parentSection.label}
                  </button>
                  
                  {/* Nested Subcategories / Combined Categories */}
                  {(!activeParentId || isParentSectionActive) && 
                    parentSection.items.map((child) => {
                      const isChildActive = activeCategorySlugs.includes(child.slug);
                      
                      return (
                        <div key={child.slug} className="flex flex-col">
                          <button
                            onClick={() => updateUrlParams({ category: child.slug })}
                            className={cn(
                              "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer ml-4 pl-3 border-l",
                              isChildActive 
                                ? "font-bold text-foreground border-l-2 border-primary" 
                                : "text-muted hover:border-neutral-350"
                            )}
                          >
                            {child.label}
                          </button>
                          
                          {/* Nested 3rd-level Styles */}
                          {isChildActive && getStylesForCategory(child.slug).length > 0 && (
                            <div className="flex flex-col gap-0.5 ml-8 pl-3 border-l border-neutral-100/60 mt-0.5 mb-1 select-none">
                              {getStylesForCategory(child.slug).map((styleItem) => {
                                const isStyleActive = activeStyle === styleItem.slug;
                                return (
                                  <button
                                    key={styleItem.slug}
                                    onClick={() => updateUrlParams({ 
                                      category: child.slug,
                                      style: styleItem.slug 
                                    })}
                                    className={cn(
                                      "text-left text-[11px] py-1 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer pl-2 -ml-3 border-l",
                                      isStyleActive 
                                        ? "font-bold text-foreground border-neutral-400" 
                                        : "text-neutral-400 border-transparent"
                                    )}
                                  >
                                    {styleItem.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Brands</h3>
          <div className="flex flex-wrap md:flex-col gap-1">
            <button
              onClick={() => updateUrlParams({ brand: null })}
              className={cn(
                "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer pl-3 border-l-2",
                activeBrand === "" ? "font-bold text-foreground border-primary" : "text-muted border-transparent"
              )}
            >
              All Brands
            </button>
            {brands.map((br) => (
              <button
                key={br.id}
                onClick={() => updateUrlParams({ brand: br.slug })}
                className={cn(
                  "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer pl-3 border-l-2",
                  activeBrand === br.slug ? "font-bold text-foreground border-primary" : "text-muted border-transparent"
                )}
              >
                {br.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Collections</h3>
          <div className="flex flex-wrap md:flex-col gap-1">
            <button
              onClick={() => updateUrlParams({ collection: null })}
              className={cn(
                "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer pl-3 border-l-2",
                activeCollection === "" ? "font-bold text-foreground border-primary" : "text-muted border-transparent"
              )}
            >
              All Collections
            </button>
            {Object.values(COLLECTIONS_MAP).map((coll) => (
              <button
                key={coll.slug}
                onClick={() => updateUrlParams({ collection: coll.slug })}
                className={cn(
                  "text-left text-xs py-1.5 transition-all duration-200 hover:text-foreground font-medium hover:cursor-pointer pl-3 border-l-2",
                  activeCollection === coll.slug ? "font-bold text-foreground border-primary" : "text-muted border-transparent"
                )}
              >
                {coll.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => updateUrlParams({ min_price: e.target.value })}
              className="w-full border border-border px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => updateUrlParams({ max_price: e.target.value })}
              className="w-full border border-border px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleClearAll} className="uppercase tracking-wider font-semibold text-xs mt-2">
          Clear All Filters
        </Button>
      </aside>

      {/* 2. Products Grid Panel */}
      <section className="flex-grow flex-1">
        {/* Dynamic Page Header for Categories/Styles */}
        {(activeCategory || activeStyle || activeBrand || activeCollection) && (
          <div className="mb-6 select-none border-b border-neutral-100 pb-6">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mb-2 uppercase">
              {activeStyle && activeStyleInfo 
                ? activeStyleInfo.label 
                : (activeCategory ? (COMBINED_CATEGORIES[activeCategory] ? COMBINED_CATEGORIES[activeCategory].label : (activeCategory.includes(",") ? activeCategorySlugs.map(slug => categories.find(c => c.slug === slug)?.name || slug).join(" & ") : (categories.find(c => c.slug === activeCategory)?.name || activeCategory)))
                : (activeBrand ? (brands.find(b => b.slug === activeBrand)?.name || activeBrand)
                : (activeCollection ? (getCollectionBySlug(activeCollection)?.label || activeCollection)
                : "")))}
            </h1>
            <p className="text-xs text-neutral-500 font-medium normal-case">
              {activeStyle && activeStyleInfo 
                ? activeStyleInfo.subHeading 
                : (activeCategory ? `Showing items from the ${COMBINED_CATEGORIES[activeCategory] ? COMBINED_CATEGORIES[activeCategory].label : (activeCategory.includes(",") ? "selected categories" : (categories.find(c => c.slug === activeCategory)?.name || activeCategory))}.`
                : (activeBrand ? `Showing items from the ${brands.find(b => b.slug === activeBrand)?.name || activeBrand} brand.`
                : (activeCollection ? `Showing items from the ${getCollectionBySlug(activeCollection)?.label || activeCollection} collection.`
                : "")))}
            </p>
          </div>
        )}

        {/* Grid Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-secondary pb-4 select-none">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            {totalProducts} Products Found
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Sort By:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border px-3 py-1 text-xs focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Catalog Body */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-secondary aspect-[3/4]" />
                <div className="h-3 w-1/3 bg-secondary rounded" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
                <div className="h-4 w-1/4 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 flex flex-col gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={handleClearAll} className="mx-auto uppercase tracking-wider font-semibold">
              Try Clearing Filters
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 flex flex-col gap-4 select-none">
            <h3 className="font-serif text-xl font-bold">No Products Match Your Criteria</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              We couldn't find any products matching the active filters. Try adjusting price ranges, search terms, or category settings.
            </p>
            <Button variant="outline" size="sm" onClick={handleClearAll} className="mx-auto uppercase tracking-wider font-semibold mt-2">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((product) => {
                const stock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16 select-none">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-center py-20 uppercase text-xs tracking-widest animate-pulse">Loading Catalog Filters...</div>}>
            <CatalogContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
