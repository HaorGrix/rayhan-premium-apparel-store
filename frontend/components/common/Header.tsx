"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { CartDrawer } from "@/components/common/CartDrawer";
import { STYLE_REGISTRY, COMBINED_CATEGORIES, COLLECTIONS_MAP, MEGA_MENU_CONFIG, getMegaMenuUrl } from "@/config/navigation";

interface CampaignItem {
  id: string;
  name: string;
  slug: string;
  cta_link: string;
  badge?: string;
}

const SEARCH_SUGGESTIONS = ["Wool Blazer", "Linen Trousers", "Chelsea Boots", "Cotton T-shirt"];

export function Header() {
  const router = useRouter();
  const { cart, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const pathname = usePathname();

  // Dynamic header menu label matching the active campaign slug
  const getCampaignMenuLabel = () => {
    if (pathname && pathname.startsWith("/campaigns/")) {
      const activeSlug = pathname.split("/campaigns/")[1];
      const currentCampaign = activeCampaigns.find(c => c.slug === activeSlug);
      if (currentCampaign) {
        return currentCampaign.name.toUpperCase();
      }
      return activeSlug.replace(/-/g, " ").toUpperCase();
    }
    return "CAMPAIGNS";
  };
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState<CampaignItem[]>([]);
  const [isCampaignsHovered, setIsCampaignsHovered] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setIsAuthenticated(!!localStorage.getItem("token"));
      }, 0);
    }
  }, []);

  // Fetch active campaigns dynamically for navigation bar
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/campaigns/active");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setActiveCampaigns(data);
          }
        }
      } catch (e) {
        console.warn("Header campaigns fetch failed, using fallback.");
      }
    }
    fetchCampaigns();
  }, []);

  const totalCartItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalWishlistItems = wishlist.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Mobile Hamburger menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-neutral-50 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-neutral-900 hover:opacity-85 transition-opacity">
              ATELIER
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav 
            className="hidden md:flex space-x-8 text-xs font-semibold tracking-widest items-center"
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Link href="/products" className="text-neutral-800 hover:text-neutral-500 transition-colors py-5">
              SHOP ALL
            </Link>
            
            {/* Hover Trigger for Men Mega Menu */}
            <Link 
              href="/products?category=men"
              className="relative py-5 cursor-pointer flex items-center text-neutral-800 hover:text-neutral-500 transition-colors"
              onMouseEnter={() => setActiveMegaMenu("men")}
              onClick={() => setActiveMegaMenu(null)}
            >
              <span className="flex items-center gap-0.5">
                MEN <ChevronDown className="h-3 w-3 opacity-60" />
              </span>
            </Link>

            {/* Hover Trigger for Women Mega Menu */}
            <Link 
              href="/products?category=women"
              className="relative py-5 cursor-pointer flex items-center text-neutral-800 hover:text-neutral-500 transition-colors"
              onMouseEnter={() => setActiveMegaMenu("women")}
              onClick={() => setActiveMegaMenu(null)}
            >
              <span className="flex items-center gap-0.5">
                WOMEN <ChevronDown className="h-3 w-3 opacity-60" />
              </span>
            </Link>

            <Link href="/products?category=accessories" className="text-neutral-800 hover:text-neutral-500 transition-colors py-5">
              ACCESSORIES
            </Link>
            <Link href="/products?category=shoes" className="text-neutral-800 hover:text-neutral-500 transition-colors py-5">
              SHOES
            </Link>
            
            {/* Dynamic Campaigns Dropdown */}
            <div 
              className="relative py-5"
              onMouseEnter={() => setIsCampaignsHovered(true)}
              onMouseLeave={() => setIsCampaignsHovered(false)}
            >
              <button className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-0.5 select-none font-bold uppercase">
                {getCampaignMenuLabel()} <ChevronDown className="h-3 w-3 opacity-80" />
              </button>
              
              <AnimatePresence>
                {isCampaignsHovered && activeCampaigns.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 left-0 w-56 border border-neutral-100 bg-white rounded-sm shadow-xl py-2.5 z-50"
                  >
                    {activeCampaigns.map((camp) => (
                      <Link
                        key={camp.id}
                        href={`/campaigns/${camp.slug}`}
                        onClick={() => setIsCampaignsHovered(false)}
                        className="flex flex-col px-4 py-2 hover:bg-neutral-50 text-xs text-neutral-800 hover:text-red-600 transition-colors"
                      >
                        <span className="font-bold">{camp.name}</span>
                        {camp.badge && (
                          <span className="text-[8px] text-red-500 font-bold tracking-widest mt-0.5">{camp.badge}</span>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Toolbar Utilities */}
          <div className="flex items-center space-x-3.5 select-none">
            
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search catalog"
              className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition-colors focus:outline-none"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              aria-label="View wishlist"
              className="relative p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition-colors"
            >
              <Heart className="h-4.5 w-4.5" />
              <AnimatePresence>
                {totalWishlistItems > 0 && (
                  <motion.span
                    key={totalWishlistItems}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white"
                  >
                    {totalWishlistItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Link Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="View shopping cart"
              className="relative p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition-colors focus:outline-none"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <AnimatePresence>
                {totalCartItems > 0 && (
                  <motion.span
                    key={totalCartItems}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Profile Link */}
            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              aria-label="Account profile"
              className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition-colors"
            >
              <User className="h-4.5 w-4.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Floating Dropdown Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-16 left-0 w-full border-b border-neutral-100 bg-white p-5 shadow-lg z-50 select-none"
          >
            <div className="mx-auto max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  placeholder="Search by product names, brands, or collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-neutral-200 px-4 py-2.5 text-xs focus:outline-none focus:border-black rounded-sm"
                  autoFocus
                />
                <button type="submit" className="bg-black text-white px-6 text-xs font-bold tracking-widest hover:bg-neutral-800 transition-colors rounded-sm uppercase">
                  SEARCH
                </button>
              </form>
              
              {/* Search suggestions */}
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-neutral-500 font-medium">
                <span className="font-bold uppercase tracking-wider text-neutral-400">Suggestions:</span>
                {SEARCH_SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="hover:text-black border border-neutral-200 hover:border-neutral-800 px-2 py-0.5 rounded-sm transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Mega Menu Dropdowns */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-16 left-0 w-full bg-white border-b border-neutral-100 shadow-xl overflow-hidden z-50 hidden md:block"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="mx-auto max-w-7xl px-8 py-12 grid grid-cols-4 gap-8 select-none">
              {activeMegaMenu === "men" ? (
                <>
                  {/* Column 1: CLOTHING */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col gap-3.5"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Clothing</span>
                    <div className="flex flex-col gap-2.5 text-xs font-medium">
                      {MEGA_MENU_CONFIG.men.clothing.map((item, idx) => (
                        <Link 
                          key={idx} 
                          href={getMegaMenuUrl(item)} 
                          onClick={() => setActiveMegaMenu(null)} 
                          className="text-neutral-600 hover:text-black transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Column 2: FEATURED STYLES */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-3.5"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Featured Styles</span>
                    <div className="flex flex-col gap-2.5 text-xs font-medium">
                      {MEGA_MENU_CONFIG.men.styles.map((item, idx) => (
                        <Link 
                          key={idx} 
                          href={getMegaMenuUrl(item)} 
                          onClick={() => setActiveMegaMenu(null)} 
                          className="text-neutral-600 hover:text-black transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Column 3: SHOES & COLLECTIONS */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Shoes</span>
                      <div className="flex flex-col gap-2.5 text-xs font-medium">
                        {MEGA_MENU_CONFIG.men.shoes.map((item, idx) => (
                          <Link 
                            key={idx} 
                            href={getMegaMenuUrl(item)} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="text-neutral-600 hover:text-black transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Collections</span>
                      <div className="flex flex-col gap-2.5 text-xs font-medium">
                        {MEGA_MENU_CONFIG.men.collections.map((item, idx) => (
                          <Link 
                            key={idx} 
                            href={getMegaMenuUrl(item)} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="text-neutral-600 hover:text-black transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Column 4 - Image Banner */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden aspect-[16/10] bg-neutral-50 group border border-neutral-100 rounded-sm"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500" 
                      alt="Men's Lookbook" 
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/35" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                      <span className="text-[8px] font-bold tracking-widest text-white/80 uppercase">Lookbook</span>
                      <h4 className="font-serif text-sm font-bold tracking-tight mt-0.5">Summer Restraint</h4>
                      <Link href="/products?category=men" onClick={() => setActiveMegaMenu(null)} className="text-[9px] font-bold tracking-widest uppercase hover:underline mt-1">Shop Now →</Link>
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Column 1: CLOTHING */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col gap-3.5"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Clothing</span>
                    <div className="flex flex-col gap-2.5 text-xs font-medium">
                      {MEGA_MENU_CONFIG.women.clothing.map((item, idx) => (
                        <Link 
                          key={idx} 
                          href={getMegaMenuUrl(item)} 
                          onClick={() => setActiveMegaMenu(null)} 
                          className="text-neutral-600 hover:text-black transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Column 2: FEATURED STYLES */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-3.5"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Featured Styles</span>
                    <div className="flex flex-col gap-2.5 text-xs font-medium">
                      {MEGA_MENU_CONFIG.women.styles.map((item, idx) => (
                        <Link 
                          key={idx} 
                          href={getMegaMenuUrl(item)} 
                          onClick={() => setActiveMegaMenu(null)} 
                          className="text-neutral-600 hover:text-black transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Column 3: SHOES & COLLECTIONS */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Shoes</span>
                      <div className="flex flex-col gap-2.5 text-xs font-medium">
                        {MEGA_MENU_CONFIG.women.shoes.map((item, idx) => (
                          <Link 
                            key={idx} 
                            href={getMegaMenuUrl(item)} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="text-neutral-600 hover:text-black transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Collections</span>
                      <div className="flex flex-col gap-2.5 text-xs font-medium">
                        {MEGA_MENU_CONFIG.women.collections.map((item, idx) => (
                          <Link 
                            key={idx} 
                            href={getMegaMenuUrl(item)} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="text-neutral-600 hover:text-black transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Column 4 - Image Banner */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden aspect-[16/10] bg-neutral-50 group border border-neutral-100 rounded-sm"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500" 
                      alt="Women's Lookbook" 
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/35" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                      <span className="text-[8px] font-bold tracking-widest text-white/80 uppercase">Editorial</span>
                      <h4 className="font-serif text-sm font-bold tracking-tight mt-0.5">Structured Geometries</h4>
                      <Link href="/products?category=women" onClick={() => setActiveMegaMenu(null)} className="text-[9px] font-bold tracking-widest uppercase hover:underline mt-1">Shop Now →</Link>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs select-none" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-64 max-w-sm h-full bg-white p-6 flex flex-col gap-6 shadow-2xl border-r border-neutral-100" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-neutral-900">ATELIER</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 py-2 border-b border-neutral-100 text-neutral-800">
                  Shop All
                </Link>
                <Link href="/products?category=men" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 py-2 border-b border-neutral-100 text-neutral-800">
                  Men
                </Link>
                <Link href="/products?category=women" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 py-2 border-b border-neutral-100 text-neutral-800">
                  Women
                </Link>
                <Link href="/products?category=accessories" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 py-2 border-b border-neutral-100 text-neutral-800">
                  Accessories
                </Link>
                <Link href="/products?category=shoes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-neutral-500 py-2 border-b border-neutral-100 text-neutral-800">
                  Shoes
                </Link>
                
                {activeCampaigns.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-100">
                    <span className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">ACTIVE CAMPAIGNS</span>
                    {activeCampaigns.map((camp) => (
                      <Link
                        key={camp.id}
                        href={`/campaigns/${camp.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold py-1.5"
                      >
                        {camp.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </header>
      
      {/* Cart Drawer Component */}
      <CartDrawer />
    </>
  );
}

export default Header;
