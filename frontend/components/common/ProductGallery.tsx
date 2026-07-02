"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
  variant_id?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  slug?: string;
}

const LABELS = ["Front", "Back", "Side", "Zoom", "Lifestyle"];

export function ProductGallery({ images, slug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset activeIndex to 0 when images change (e.g. switching color swatches)
  React.useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  // Dynamic generator from the passed images
  const baseImages = images.length > 0 
    ? images.map(img => img.image_url)
    : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"];

  const img1 = baseImages[0];
  const img2 = baseImages[1] || img1;

  const galleryUrls = [
    img1, // Front
    img2, // Back
    `${img1}&q=80&fit=crop&crop=left`, // Side
    `${img1}&auto=format&fit=crop&w=450&h=450`, // Zoom
    `${img2}&auto=format&fit=crop&w=800&h=600`, // Lifestyle
  ];

  const activeImage = galleryUrls[activeIndex];

  // Zoom States
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-5 select-none">
      {/* Thumbnail List (Left side on Desktop, Bottom on Mobile) */}
      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[600px] scrollbar-none py-1">
        {galleryUrls.map((url, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <motion.div
              role="button"
              tabIndex={0}
              aria-label={`View product image ${LABELS[idx]}`}
              onClick={() => handleThumbnailClick(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "h-24 w-18 overflow-hidden border bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black transition-all duration-200 cursor-pointer rounded-sm",
                idx === activeIndex 
                  ? "border-black scale-[1.03] shadow-sm" 
                  : "border-neutral-200 opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={url}
                alt={LABELS[idx]}
                className="h-full w-full object-cover object-center"
              />
            </motion.div>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest",
              idx === activeIndex ? "text-neutral-900 font-extrabold" : "text-neutral-400"
            )}>
              {LABELS[idx]}
            </span>
          </div>
        ))}
      </div>

      {/* Main Image View with Hover Zoom and Fade Transitions */}
      <div 
        className="relative flex-1 overflow-hidden bg-neutral-50 aspect-[3/4] max-w-[550px] border border-neutral-100 cursor-zoom-in rounded-sm shadow-xs"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt="Main product detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-full w-full object-cover object-center"
            style={{
              transform: isZoomed ? "scale(2.2)" : "scale(1)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        </AnimatePresence>
        
        {/* Subtle indicator hint */}
        {!isZoomed && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-[9px] text-white px-2.5 py-1 uppercase tracking-widest pointer-events-none select-none font-bold rounded-sm backdrop-blur-xs">
            Hover to zoom
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
