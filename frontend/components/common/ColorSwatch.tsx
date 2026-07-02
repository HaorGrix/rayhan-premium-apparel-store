"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

// Map color names to CSS classes/hex values for rendering swatches
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

export function ColorSwatch({ color, isSelected, isAvailable = true, onClick }: ColorSwatchProps) {
  const lowerColor = color.toLowerCase();
  const hexColor = COLOR_MAP[lowerColor] || "#d1d5db"; // default gray if unknown

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="radio"
      aria-checked={isSelected}
      aria-label={`Color: ${color}${!isAvailable ? " (Out of stock)" : ""}`}
      tabIndex={isAvailable ? 0 : -1}
      onClick={isAvailable ? onClick : undefined}
      onKeyDown={isAvailable ? handleKeyDown : undefined}
      whileHover={isAvailable ? { scale: 1.08 } : {}}
      whileTap={isAvailable ? { scale: 0.92 } : {}}
      className={cn(
        "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary select-none",
        isSelected && "ring-1 ring-black ring-offset-2 border-black",
        !isAvailable && "opacity-40 cursor-not-allowed border-dashed"
      )}
    >
      <span
        className={cn(
          "h-7 w-7 rounded-full border border-black/10",
          lowerColor === "white" && "border-black/20"
        )}
        style={{ backgroundColor: hexColor }}
      />
      {!isAvailable && (
        <span className="absolute h-[1px] w-8 rotate-45 bg-muted-foreground/60" />
      )}
    </motion.div>
  );
}

export default ColorSwatch;
