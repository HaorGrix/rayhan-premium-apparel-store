export interface NavigationStyle {
  slug: string;
  label: string;
  parentCategorySlug: string; // Parent subcategory slug (or comma-separated list of slugs)
  filterKeyword: string;
  subHeading: string;
}

export interface CombinedCategory {
  slug: string;
  label: string;
  parentSlug: string;
}

export interface CollectionMapping {
  slug: string;
  dbSlug: string;
  label: string;
}

// 1. Centralized Style Registry
export const STYLE_REGISTRY: Record<string, NavigationStyle> = {
  // Men Trousers Styles
  "linen-trousers": { 
    slug: "linen-trousers",
    label: "Linen Trousers", 
    parentCategorySlug: "men-trousers", 
    filterKeyword: "linen",
    subHeading: "Showing all Linen Trousers from the Men's Trousers category."
  },
  "formal-trousers": {
    slug: "formal-trousers",
    label: "Formal Trousers",
    parentCategorySlug: "men-trousers",
    filterKeyword: "formal",
    subHeading: "Showing all Formal Trousers from the Men's Trousers category."
  },
  "cargo-pants": {
    slug: "cargo-pants",
    label: "Cargo Pants",
    parentCategorySlug: "men-trousers",
    filterKeyword: "cargo",
    subHeading: "Showing all Cargo Pants from the Men's Trousers category."
  },
  "chinos": {
    slug: "chinos",
    label: "Chinos",
    parentCategorySlug: "men-trousers",
    filterKeyword: "chino",
    subHeading: "Showing all Chinos from the Men's Trousers category."
  },
  // Men Blazers Styles
  "tailored-blazers": {
    slug: "tailored-blazers",
    label: "Tailored Blazers",
    parentCategorySlug: "men-blazers",
    filterKeyword: "tailored",
    subHeading: "Showing all Tailored Blazers from the Men's Blazers category."
  },
  "classic-blazers": {
    slug: "classic-blazers",
    label: "Classic Blazers",
    parentCategorySlug: "men-blazers",
    filterKeyword: "classic",
    subHeading: "Showing all Classic Blazers from the Men's Blazers category."
  },
  // Men Outerwear Styles
  "premium-outerwear": {
    slug: "premium-outerwear",
    label: "Premium Outerwear",
    parentCategorySlug: "men-jackets,men-hoodies",
    filterKeyword: "premium",
    subHeading: "Showing all Premium Outerwear from the Men's Jackets and Hoodies categories."
  },
  "casual-jackets": {
    slug: "casual-jackets",
    label: "Casual Jackets",
    parentCategorySlug: "men-jackets",
    filterKeyword: "casual",
    subHeading: "Showing all Casual Jackets from the Men's Jackets category."
  },
  // Women Dresses Styles
  "women-organic-dresses": {
    slug: "women-organic-dresses",
    label: "Organic Dresses",
    parentCategorySlug: "women-dresses",
    filterKeyword: "organic",
    subHeading: "Showing all Organic Dresses from the Women's Dresses category."
  },
  "women-casual-dresses": {
    slug: "women-casual-dresses",
    label: "Casual Dresses",
    parentCategorySlug: "women-dresses",
    filterKeyword: "casual",
    subHeading: "Showing all Casual Dresses from the Women's Dresses category."
  },
  // Women Trousers Styles
  "women-linen-trousers": {
    slug: "women-linen-trousers",
    label: "Linen Trousers",
    parentCategorySlug: "women-trousers",
    filterKeyword: "linen",
    subHeading: "Showing all Linen Trousers from the Women's Trousers category."
  },
  "women-tailored-trousers": {
    slug: "women-tailored-trousers",
    label: "Tailored Trousers",
    parentCategorySlug: "women-trousers",
    filterKeyword: "tailored",
    subHeading: "Showing all Tailored Trousers from the Women's Trousers category."
  },
  // Women Knitwear Styles
  "women-knitwear-style": {
    slug: "women-knitwear-style",
    label: "Premium Knitwear",
    parentCategorySlug: "women-knitwear",
    filterKeyword: "premium",
    subHeading: "Showing all Premium Knitwear from the Women's Knitwear category."
  },
  "women-cardigans": {
    slug: "women-cardigans",
    label: "Cardigans",
    parentCategorySlug: "women-knitwear",
    filterKeyword: "cardigan",
    subHeading: "Showing all Cardigans from the Women's Knitwear category."
  },
  // Women Jackets Styles
  "women-tailored-jackets": {
    slug: "women-tailored-jackets",
    label: "Tailored Jackets",
    parentCategorySlug: "women-jackets",
    filterKeyword: "tailored",
    subHeading: "Showing all Tailored Jackets from the Women's Jackets category."
  },
  "women-coats-style": {
    slug: "women-coats-style",
    label: "Coats",
    parentCategorySlug: "women-jackets",
    filterKeyword: "coat",
    subHeading: "Showing all Coats from the Women's Jackets category."
  },
  // Shoes Styles
  "chelsea-boots": {
    slug: "chelsea-boots",
    label: "Chelsea Boots",
    parentCategorySlug: "shoes-boots",
    filterKeyword: "chelsea",
    subHeading: "Showing all Chelsea Boots from the Boots category."
  },
  "minimalist-sneakers": {
    slug: "minimalist-sneakers",
    label: "Minimalist Sneakers",
    parentCategorySlug: "shoes-sneakers",
    filterKeyword: "minimalist",
    subHeading: "Showing all Minimalist Sneakers from the Sneakers category."
  },
  "leather-loafers": {
    slug: "leather-loafers",
    label: "Leather Loafers",
    parentCategorySlug: "shoes-loafers",
    filterKeyword: "leather",
    subHeading: "Showing all Leather Loafers from the Loafers category."
  },
  "minimalist-sandals": {
    slug: "minimalist-sandals",
    label: "Minimalist Sandals",
    parentCategorySlug: "shoes-sandals",
    filterKeyword: "minimalist",
    subHeading: "Showing all Minimalist Sandals from the Sandals category."
  }
};

// 2. Combined Categories Registry
export const COMBINED_CATEGORIES: Record<string, CombinedCategory> = {
  "men-t-shirts,men-polo-shirts": {
    slug: "men-t-shirts,men-polo-shirts",
    label: "Tees & Polos",
    parentSlug: "men"
  },
  "men-jackets,men-hoodies": {
    slug: "men-jackets,men-hoodies",
    label: "Outerwear",
    parentSlug: "men"
  },
  "women-tops,women-blouses": {
    slug: "women-tops,women-blouses",
    label: "Tops & Blouses",
    parentSlug: "women"
  },
  "women-trousers,women-skirts": {
    slug: "women-trousers,women-skirts",
    label: "Trousers & Skirts",
    parentSlug: "women"
  },
  "women-jackets,women-coats": {
    slug: "women-jackets,women-coats",
    label: "Jackets & Coats",
    parentSlug: "women"
  }
};

// 3. Collection URL to Database Slug Mapping
export const COLLECTIONS_MAP: Record<string, CollectionMapping> = {
  "summer-linen": {
    slug: "summer-linen",
    dbSlug: "linen-collection",
    label: "Summer Linen"
  },
  "minimalist-essentials": {
    slug: "minimalist-essentials",
    dbSlug: "essentials",
    label: "Minimalist Essentials"
  },
  "new-season": {
    slug: "new-season",
    dbSlug: "new-arrivals",
    label: "New Season Arrivals"
  },
  "silk-linen": {
    slug: "silk-linen",
    dbSlug: "linen-collection",
    label: "Silk & Linen"
  },
  "editorial-edit": {
    slug: "editorial-edit",
    dbSlug: "trending-now",
    label: "Editorial Edit"
  }
};

// Helper: Get styles grouped by category slug
export const getStylesForCategory = (categorySlug: string): NavigationStyle[] => {
  return Object.values(STYLE_REGISTRY).filter(style => 
    style.parentCategorySlug.split(",").includes(categorySlug)
  );
};

// Helper: Resolve a style by slug
export const getStyleBySlug = (slug: string): NavigationStyle | undefined => {
  return STYLE_REGISTRY[slug];
};

// Helper: Resolve collection by slug
export const getCollectionBySlug = (slug: string): CollectionMapping | undefined => {
  return COLLECTIONS_MAP[slug];
};

// Helper: Reverse map collection database slug back to registry config
export const getCollectionByDbSlug = (dbSlug: string): CollectionMapping | undefined => {
  return Object.values(COLLECTIONS_MAP).find(c => c.dbSlug === dbSlug);
};

// 4. Sidebar Hierarchy Definition
export interface SidebarSubItem {
  type: "category" | "combined_category";
  label: string;
  slug: string;
}

export interface SidebarSection {
  label: string;
  slug: string;
  items: SidebarSubItem[];
}

export const SIDEBAR_STRUCTURE: SidebarSection[] = [
  {
    label: "Men",
    slug: "men",
    items: [
      { type: "combined_category", label: "Tees & Polos", slug: "men-t-shirts,men-polo-shirts" },
      { type: "category", label: "T-Shirts", slug: "men-t-shirts" },
      { type: "category", label: "Shirts", slug: "men-shirts" },
      { type: "category", label: "Polo Shirts", slug: "men-polo-shirts" },
      { type: "category", label: "Trousers", slug: "men-trousers" },
      { type: "category", label: "Jeans", slug: "men-jeans" },
      { type: "category", label: "Blazers", slug: "men-blazers" },
      { type: "combined_category", label: "Outerwear", slug: "men-jackets,men-hoodies" },
      { type: "category", label: "Jackets", slug: "men-jackets" },
      { type: "category", label: "Hoodies", slug: "men-hoodies" },
      { type: "category", label: "Sweaters", slug: "men-sweaters" },
      { type: "category", label: "Shorts", slug: "men-shorts" },
      { type: "category", label: "Suits", slug: "men-suits" }
    ]
  },
  {
    label: "Women",
    slug: "women",
    items: [
      { type: "category", label: "Dresses", slug: "women-dresses" },
      { type: "combined_category", label: "Tops & Blouses", slug: "women-tops,women-blouses" },
      { type: "category", label: "Tops", slug: "women-tops" },
      { type: "category", label: "Blouses", slug: "women-blouses" },
      { type: "category", label: "Shirts", slug: "women-shirts" },
      { type: "combined_category", label: "Trousers & Skirts", slug: "women-trousers,women-skirts" },
      { type: "category", label: "Trousers", slug: "women-trousers" },
      { type: "category", label: "Skirts", slug: "women-skirts" },
      { type: "category", label: "Jeans", slug: "women-jeans" },
      { type: "category", label: "Knitwear", slug: "women-knitwear" },
      { type: "combined_category", label: "Jackets & Coats", slug: "women-jackets,women-coats" },
      { type: "category", label: "Jackets", slug: "women-jackets" },
      { type: "category", label: "Coats", slug: "women-coats" }
    ]
  },
  {
    label: "Accessories",
    slug: "accessories",
    items: [
      { type: "category", label: "Bags", slug: "accessories-bags" },
      { type: "category", label: "Wallets", slug: "accessories-wallets" },
      { type: "category", label: "Belts", slug: "accessories-belts" },
      { type: "category", label: "Sunglasses", slug: "accessories-sunglasses" },
      { type: "category", label: "Watches", slug: "accessories-watches" },
      { type: "category", label: "Hats", slug: "accessories-hats" },
      { type: "category", label: "Scarves", slug: "accessories-scarves" }
    ]
  },
  {
    label: "Shoes",
    slug: "shoes",
    items: [
      { type: "category", label: "Sneakers", slug: "shoes-sneakers" },
      { type: "category", label: "Boots", slug: "shoes-boots" },
      { type: "category", label: "Sandals", slug: "shoes-sandals" },
      { type: "category", label: "Loafers", slug: "shoes-loafers" },
      { type: "category", label: "Heels", slug: "shoes-heels" }
    ]
  }
];

export const MEGA_MENU_CONFIG = {
  men: {
    clothing: [
      { label: "T-Shirts", slug: "men-t-shirts" },
      { label: "Shirts", slug: "men-shirts" },
      { label: "Polo Shirts", slug: "men-polo-shirts" },
      { label: "Trousers", slug: "men-trousers" },
      { label: "Jeans", slug: "men-jeans" },
      { label: "Blazers", slug: "men-blazers" },
      { label: "Outerwear", slug: "men-jackets,men-hoodies" }
    ],
    styles: [
      { label: "Tees & Polos", slug: "men-t-shirts,men-polo-shirts", isCombined: true },
      { label: "Linen Trousers", styleSlug: "linen-trousers" },
      { label: "Tailored Blazers", styleSlug: "tailored-blazers" },
      { label: "Premium Outerwear", styleSlug: "premium-outerwear" }
    ],
    shoes: [
      { label: "Chelsea Boots", styleSlug: "chelsea-boots" },
      { label: "Minimalist Sneakers", styleSlug: "minimalist-sneakers" },
      { label: "Leather Loafers", styleSlug: "leather-loafers" }
    ],
    collections: [
      { label: "Summer Linen", collectionSlug: "summer-linen" },
      { label: "Minimalist Essentials", collectionSlug: "minimalist-essentials" },
      { label: "New Season Arrivals", collectionSlug: "new-season" }
    ]
  },
  women: {
    clothing: [
      { label: "Dresses", slug: "women-dresses" },
      { label: "Tops & Blouses", slug: "women-tops,women-blouses" },
      { label: "Shirts", slug: "women-shirts" },
      { label: "Trousers & Skirts", slug: "women-trousers,women-skirts" },
      { label: "Knitwear", slug: "women-knitwear" },
      { label: "Jackets & Coats", slug: "women-jackets,women-coats" }
    ],
    styles: [
      { label: "Organic Dresses", styleSlug: "women-organic-dresses" },
      { label: "Linen Trousers", styleSlug: "women-linen-trousers" },
      { label: "Premium Knitwear", styleSlug: "women-knitwear-style" },
      { label: "Tailored Jackets", styleSlug: "women-tailored-jackets" }
    ],
    shoes: [
      { label: "Heeled Boots", slug: "shoes-boots" },
      { label: "Leather Loafers", styleSlug: "leather-loafers" },
      { label: "Minimalist Sandals", styleSlug: "minimalist-sandals" }
    ],
    collections: [
      { label: "Silk & Linen", collectionSlug: "silk-linen" },
      { label: "Editorial Edit", collectionSlug: "editorial-edit" },
      { label: "New Season Arrivals", collectionSlug: "new-season" }
    ]
  }
};

export const getMegaMenuUrl = (item: { slug?: string; styleSlug?: string; collectionSlug?: string; isCombined?: boolean }) => {
  if (item.styleSlug) {
    const style = STYLE_REGISTRY[item.styleSlug];
    if (style) {
      return `/products?category=${style.parentCategorySlug}&style=${style.slug}`;
    }
  }
  if (item.collectionSlug) {
    return `/products?collection=${item.collectionSlug}`;
  }
  if (item.slug) {
    return `/products?category=${item.slug}`;
  }
  return "/products";
};

