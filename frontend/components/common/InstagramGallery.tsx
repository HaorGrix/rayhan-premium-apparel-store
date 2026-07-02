"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ShoppingBag, 
  X,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserMinimal {
  first_name: string;
  last_name: string;
}

interface ProductMinimal {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
}

interface GalleryItem {
  id: string;
  product_id: string;
  image_url: string;
  caption: string;
  user?: UserMinimal;
  product?: ProductMinimal;
}

interface InstagramGalleryProps {
  gallery: GalleryItem[];
}

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({ gallery }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Interactive Social States
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);
  
  // Lightbox Modal State
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(gallery.length / itemsPerPage);

  useEffect(() => {
    setIsVisible(true);
    setIsLoaded(true);

    // Initialize mock likes
    const initialLikes: Record<string, number> = {};
    gallery.forEach((item) => {
      // Seed a realistic number of likes based on ID hash
      let seed = 42;
      for (let i = 0; i < item.id.length; i++) {
        seed += item.id.charCodeAt(i);
      }
      initialLikes[item.id] = (seed % 150) + 40;
    });
    setLikesCount(initialLikes);
  }, [gallery]);

  const handlePageChange = (newPage: number) => {
    setIsLoaded(false);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsLoaded(true);
    }, 150);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = gallery.slice(startIndex, startIndex + itemsPerPage);

  // Polaroid / Card offsets for scattered visual layout on desktop
  const offsets = [
    { x: "-340px", y: "15px", rotation: -2, zIndex: 40, direction: "left" as const, tagPos: { top: "45%", left: "30%" } },
    { x: "-110px", y: "-25px", rotation: 1, zIndex: 30, direction: "right" as const, tagPos: { top: "60%", left: "65%" } },
    { x: "115px", y: "20px", rotation: -1, zIndex: 20, direction: "left" as const, tagPos: { top: "35%", left: "55%" } },
    { x: "340px", y: "-10px", rotation: 2, zIndex: 10, direction: "right" as const, tagPos: { top: "50%", left: "40%" } },
  ];

  // Map items to layout offsets
  const mappedPhotos = currentItems.map((item, idx) => {
    const offset = offsets[idx % offsets.length];
    return {
      ...item,
      ...offset,
      order: idx,
    };
  });

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const photoVariants = {
    hidden: (custom: { x: string; y: string }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 0.95,
      opacity: 0,
    }),
    visible: (custom: { x: string; y: string; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0, 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        mass: 1,
        delay: custom.order * 0.08,
      },
    }),
    exit: (custom: { x: string; y: string }) => ({
      x: custom.x,
      y: custom.y,
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn" as const,
      }
    })
  };

  // Like Interactions
  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = !likedStatus[id];
    setLikedStatus(prev => ({ ...prev, [id]: isLiked }));
    setLikesCount(prev => ({ ...prev, [id]: prev[id] + (isLiked ? 1 : -1) }));
  };

  const handleDoubleTap = (id: string) => {
    if (!likedStatus[id]) {
      setLikedStatus(prev => ({ ...prev, [id]: true }));
      setLikesCount(prev => ({ ...prev, [id]: prev[id] + 1 }));
    }
    // Trigger pop heart overlay
    setHeartAnimId(id);
    setTimeout(() => {
      setHeartAnimId(null);
    }, 850);
  };

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Submitter Name Formatter
  const getSubmitterName = (item: GalleryItem) => {
    if (item.user && item.user.first_name) {
      return `${item.user.first_name.toLowerCase()}_${item.user.last_name.toLowerCase()}`;
    }
    return "atelier_guest";
  };

  const getSubmitterFullName = (item: GalleryItem) => {
    if (item.user && item.user.first_name) {
      return `${item.user.first_name} ${item.user.last_name}`;
    }
    return "Atelier Guest";
  };

  // Get consistent location based on item ID
  const getMockLocation = (id: string) => {
    const locations = ["Paris, France", "Milan, Italy", "New York, NY", "Tokyo, Japan", "London, UK"];
    let num = 0;
    for (let i = 0; i < id.length; i++) num += id.charCodeAt(i);
    return locations[num % locations.length];
  };

  // Generate mock comments for detail modal
  const getMockComments = (item: GalleryItem) => {
    const commentsSeed = [
      { user: "alex_mcqueen", text: "Stunning look! Absolute perfection. 🔥" },
      { user: "style_curator", text: "This fit is everything! Need that jacket ASAP." },
      { user: "fashion_diaries", text: "Obsessed with the styling here. 😍" },
      { user: "minimal_vibes", text: "Atelier classics never fail. Timeless elegance." },
      { user: "kristen_w", text: "Such a beautiful composition! Love this shot." }
    ];
    let num = 0;
    for (let i = 0; i < item.id.length; i++) num += item.id.charCodeAt(i);
    
    // Pick 2-3 randomized comments based on item hash
    return [
      commentsSeed[num % commentsSeed.length],
      commentsSeed[(num + 1) % commentsSeed.length],
      commentsSeed[(num + 2) % commentsSeed.length],
    ];
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. MOBILE SWIPE VIEW (Sleek Swipe Instagram Cards) */}
      <div className="w-full md:hidden overflow-hidden relative select-none">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-4 scrollbar-none">
          {gallery.map((g) => (
            <div 
              key={g.id} 
              className="snap-center shrink-0 w-[270px] bg-white border border-neutral-100 rounded-lg shadow-sm flex flex-col"
            >
              {/* Instagram Header */}
              <div className="flex items-center justify-between p-3 border-b border-neutral-50">
                <div className="flex items-center gap-2">
                  {/* Sunset gradient circle around initials */}
                  <div className="h-7 w-7 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center border border-white">
                      <span className="text-[9px] font-bold text-neutral-800 uppercase tracking-tighter">
                        {g.user?.first_name ? `${g.user.first_name[0]}${g.user.last_name[0]}` : "AT"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-neutral-900 leading-none">@{getSubmitterName(g)}</span>
                    <span className="text-[8px] text-neutral-400 font-medium leading-tight mt-0.5">{getMockLocation(g.id)}</span>
                  </div>
                </div>
                <MoreHorizontal size={14} className="text-neutral-400" />
              </div>

              {/* Instagram Image Frame (Double-tap to like) */}
              <div 
                className="relative aspect-square overflow-hidden bg-neutral-50 cursor-pointer"
                onDoubleClick={() => handleDoubleTap(g.id)}
              >
                <Link href={`/products/${g.product?.slug || g.product_id}`} className="block h-full w-full">
                  <img
                    src={g.image_url}
                    alt={g.caption}
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                    loading="lazy"
                  />
                </Link>

                {/* Big Pop-up Heart Overlay on Double-Tap */}
                <AnimatePresence>
                  {heartAnimId === g.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.3, 0.9, 1], opacity: [0, 1, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <Heart size={80} className="fill-white stroke-white drop-shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <button onClick={(e) => handleLike(g.id, e)} className="hover:scale-110 active:scale-95 transition-transform">
                    <Heart 
                      size={18} 
                      className={cn(
                        likedStatus[g.id] ? "fill-red-500 stroke-red-500" : "stroke-neutral-800 hover:text-red-500"
                      )} 
                    />
                  </button>
                  <button onClick={() => setActivePhoto(g)} className="hover:scale-110 active:scale-95 transition-transform">
                    <MessageCircle size={18} className="stroke-neutral-800" />
                  </button>
                  <Send size={18} className="stroke-neutral-800 cursor-pointer" />
                </div>
                <button onClick={(e) => handleSave(g.id, e)} className="hover:scale-110 active:scale-95 transition-transform">
                  <Bookmark 
                    size={18} 
                    className={cn(
                      savedStatus[g.id] ? "fill-neutral-900 stroke-neutral-900" : "stroke-neutral-800"
                    )}
                  />
                </button>
              </div>

              {/* Likes & Caption Text */}
              <div className="px-3 pb-4 flex flex-col text-left">
                <span className="text-[10px] font-bold text-neutral-900 leading-none">
                  {likesCount[g.id]?.toLocaleString()} likes
                </span>
                <p className="text-[10px] text-neutral-600 leading-normal mt-1.5 select-text">
                  <span className="font-bold text-neutral-950 mr-1">@{getSubmitterName(g)}</span>
                  {g.caption}
                </p>
                {/* View Details Button */}
                <Link 
                  href={`/products/${g.product?.slug || g.product_id}`}
                  className="text-[9px] text-[#d4af37] font-bold uppercase tracking-widest mt-3.5 hover:text-neutral-800 transition-colors text-left flex items-center gap-1"
                >
                  Shop Fit & Details <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase text-center mt-1 animate-pulse">
          Swipe to explore lookbook
        </p>
      </div>

      {/* 2. DESKTOP INTERACTIVE SCATTER VIEW (Sleek Instagram Cards with Springs) */}
      <div className="relative mb-6 h-[420px] w-full items-center justify-center hidden md:flex select-none">
        {/* Modern minimal dot grid accent */}
        <div className="absolute inset-0 top-[40px] -z-10 h-[280px] w-full bg-transparent bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="relative mx-auto flex w-full max-w-7xl justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            exit="hidden"
          >
            <div className="relative h-[240px] w-[240px]">
              {[...mappedPhotos].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute left-0 top-0 cursor-grab active:cursor-grabbing group/instagram"
                  style={{ zIndex: photo.zIndex }}
                  variants={photoVariants}
                  custom={{
                    x: photo.x,
                    y: photo.y,
                    order: photo.order,
                  }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  whileTap={{ scale: 1.15, zIndex: 9999 }}
                  whileHover={{
                    scale: 1.06,
                    rotate: 1.2 * (photo.direction === "left" ? -1 : 1),
                    zIndex: 9999,
                  }}
                  dragElastic={0.06}
                >
                  {/* Sleek Instagram Card Frame */}
                  <div 
                    style={{ transform: `rotate(${photo.rotation}deg)` }}
                    className="bg-white border border-neutral-200/70 shadow-md hover:shadow-2xl hover:border-neutral-300 transition-all duration-300 rounded-lg overflow-hidden flex flex-col w-[230px]"
                  >
                    {/* IG Post Header */}
                    <div className="flex items-center justify-between p-2.5 border-b border-neutral-100/60 bg-neutral-50/20">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6.5 w-6.5 rounded-full p-[1px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                          <div className="h-full w-full rounded-full bg-white flex items-center justify-center border border-white">
                            <span className="text-[8px] font-bold text-neutral-800 uppercase tracking-tighter">
                              {photo.user?.first_name ? `${photo.user.first_name[0]}${photo.user.last_name[0]}` : "AT"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col text-left leading-none">
                          <span className="text-[9px] font-bold text-neutral-900">@{getSubmitterName(photo)}</span>
                          <span className="text-[7.5px] text-neutral-400 font-medium mt-0.5">{getMockLocation(photo.id)}</span>
                        </div>
                      </div>
                      <MoreHorizontal size={12} className="text-neutral-400 cursor-pointer" />
                    </div>

                    {/* Image Area (Double-tap to like) */}
                    <div 
                      className="relative h-[208px] w-[208px] mx-auto overflow-hidden bg-neutral-50 select-none group/img"
                      onDoubleClick={() => handleDoubleTap(photo.id)}
                    >
                      <Link 
                        href={`/products/${photo.product?.slug || photo.product_id}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="block h-full w-full"
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption}
                          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                          draggable={false}
                        />
                      </Link>

                      {/* Double-tap Big Heart Overlay */}
                      <AnimatePresence>
                        {heartAnimId === photo.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.4, 0.95, 1], opacity: [0, 1, 1, 0] }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                          >
                            <Heart size={60} className="fill-white stroke-white drop-shadow-md" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2.5">
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => handleLike(photo.id, e)} 
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Heart 
                            size={16} 
                            className={cn(
                              likedStatus[photo.id] ? "fill-red-500 stroke-red-500" : "stroke-neutral-800 hover:text-red-500"
                            )} 
                          />
                        </button>
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => setActivePhoto(photo)} 
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <MessageCircle size={16} className="stroke-neutral-800" />
                        </button>
                        <Send size={16} className="stroke-neutral-800 cursor-pointer" />
                      </div>
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleSave(photo.id, e)} 
                        className="hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Bookmark 
                          size={16} 
                          className={cn(
                            savedStatus[photo.id] ? "fill-neutral-900 stroke-neutral-900" : "stroke-neutral-800"
                          )}
                        />
                      </button>
                    </div>

                    {/* Likes & Short Caption */}
                    <div className="px-2.5 pb-3.5 flex flex-col text-left leading-tight">
                      <span className="text-[9.5px] font-bold text-neutral-900">
                        {likesCount[photo.id]?.toLocaleString()} likes
                      </span>
                      <p className="text-[9px] text-neutral-600 line-clamp-2 mt-1 select-text">
                        <span className="font-bold text-neutral-950 mr-1">@{getSubmitterName(photo)}</span>
                        {photo.caption}
                      </p>
                      {/* Shop product overlay tag trigger */}
                      <Link 
                        href={`/products/${photo.product?.slug || photo.product_id}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-[8.5px] text-[#d4af37] font-bold uppercase tracking-wider mt-2.5 hover:text-neutral-800 transition-colors flex items-center gap-0.5 text-left"
                      >
                        Shop Look & Details &rarr;
                      </Link>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. PAGINATION SLIDER (Desktop Only) */}
      {totalPages > 1 && (
        <div className="hidden md:flex items-center gap-6 mt-8 select-none">
          <button
            onClick={() => handlePageChange((currentPage - 1 + totalPages) % totalPages)}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 active:scale-95 transition-all duration-200"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="font-serif text-[11px] tracking-[0.2em] text-neutral-500">
            {String(currentPage + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>

          <button
            onClick={() => handlePageChange((currentPage + 1) % totalPages)}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 active:scale-95 transition-all duration-200"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 4. IMMERSIVE INSTAGRAM SPLIT-PANE MODAL (Shop the Look Lightbox) */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none">
            {/* Dark blur background backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
              onClick={() => setActivePhoto(null)}
            />

            {/* Modal Card Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-xl overflow-hidden max-w-4xl w-full h-[85vh] md:h-[620px] flex flex-col md:flex-row shadow-2xl z-10 border border-neutral-100"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 md:-top-10 md:-right-10 bg-neutral-900/60 md:bg-transparent text-white md:text-neutral-300 hover:text-white p-2 rounded-full md:p-0 transition-colors z-30"
              >
                <X size={22} />
              </button>

              {/* Left Column: Visual Image Panel */}
              <div className="w-full md:w-3/5 h-[40vh] md:h-full bg-neutral-950 flex items-center justify-center relative select-none">
                <img 
                  src={activePhoto.image_url} 
                  alt={activePhoto.caption}
                  className="w-full h-full object-cover md:object-contain select-none pointer-events-none"
                  draggable={false}
                />

              </div>

              {/* Right Column: Detailed Instagram Feed Sidebar */}
              <div className="w-full md:w-2/5 h-[45vh] md:h-full flex flex-col bg-white justify-between select-text text-left">
                {/* 1. Header (User Info) */}
                <div className="flex items-center gap-3 p-4 border-b border-neutral-100 shrink-0">
                  <div className="h-8 w-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center border border-white">
                      <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-tighter">
                        {activePhoto.user?.first_name ? `${activePhoto.user.first_name[0]}${activePhoto.user.last_name[0]}` : "AT"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-900 leading-none">@{getSubmitterName(activePhoto)}</span>
                    <span className="text-[9px] text-neutral-400 font-semibold mt-0.5">{getMockLocation(activePhoto.id)}</span>
                  </div>
                </div>

                {/* 2. Scrollable Comments Feed Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 border-b border-neutral-100/60 scrollbar-thin">
                  {/* Original Post Caption */}
                  <div className="flex gap-3 items-start">
                    <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-neutral-800 uppercase">
                        {activePhoto.user?.first_name ? `${activePhoto.user.first_name[0]}${activePhoto.user.last_name[0]}` : "AT"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-neutral-800 leading-relaxed">
                        <span className="font-bold text-neutral-900 mr-1.5">@{getSubmitterName(activePhoto)}</span>
                        {activePhoto.caption}
                      </p>
                      <span className="text-[9px] text-neutral-400 font-semibold mt-1">1 day ago</span>
                    </div>
                  </div>

                  {/* Dynamic Seeded Comments */}
                  {getMockComments(activePhoto).map((cmt, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="h-7 w-7 rounded-full bg-neutral-100/70 border border-neutral-200/40 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-neutral-600 uppercase">
                          {cmt.user[0] + cmt.user[cmt.user.length-1]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-800 leading-relaxed">
                          <span className="font-bold text-neutral-900 mr-1.5">@{cmt.user}</span>
                          {cmt.text}
                        </p>
                        <span className="text-[9px] text-neutral-400 font-semibold mt-1">{(idx + 1) * 3}h ago</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Bottom Shopping Link Card & Actions */}
                <div className="p-4 bg-neutral-50/40 flex flex-col gap-4 shrink-0">
                  {/* Heart Action & Likes */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => handleLike(activePhoto.id, e)} className="hover:scale-110 active:scale-95 transition-transform">
                        <Heart 
                          size={18} 
                          className={cn(
                            likedStatus[activePhoto.id] ? "fill-red-500 stroke-red-500" : "stroke-neutral-800 hover:text-red-500"
                          )} 
                        />
                      </button>
                      <span className="text-xs font-bold text-neutral-900 ml-1.5">
                        {likesCount[activePhoto.id]?.toLocaleString()} likes
                      </span>
                    </div>
                  </div>

                  {/* SHOP THE LOOK PRODUCT DIRECT CARD */}
                  {activePhoto.product && (
                    <div className="bg-white border border-neutral-200/80 rounded-lg p-3 flex items-center justify-between shadow-xs select-none">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-100">
                          {/* Use the lookbook photo itself as product thumbnail placeholder or a generic icon */}
                          <img 
                            src={activePhoto.image_url} 
                            alt={activePhoto.product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[11px] font-bold text-neutral-800 leading-none truncate max-w-[140px]">{activePhoto.product.name}</span>
                          <span className="text-[10px] font-semibold text-neutral-500 mt-1">${activePhoto.product.price}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/products/${activePhoto.product.slug}`}
                        className="bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0"
                        onClick={() => setActivePhoto(null)}
                      >
                        Shop <ArrowRight size={10} />
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
