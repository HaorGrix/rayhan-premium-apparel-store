"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  size: string;
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

export function SizeSelector({ size, isSelected, isAvailable = true, onClick }: SizeSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={`Size: ${size}${!isAvailable ? " (Out of stock)" : ""}`}
      tabIndex={isAvailable ? 0 : -1}
      onClick={isAvailable ? onClick : undefined}
      onKeyDown={isAvailable ? handleKeyDown : undefined}
      className={cn(
        "relative flex h-11 min-w-[48px] items-center justify-center border border-border px-3 text-xs font-semibold uppercase transition-all duration-200 cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        isSelected && "bg-primary text-primary-foreground border-primary",
        !isAvailable && "opacity-30 cursor-not-allowed bg-secondary/50 border-dashed"
      )}
    >
      <span className={cn(isSelected ? "text-primary-foreground" : "text-foreground")}>
        {size}
      </span>
      {!isAvailable && (
        <span className="absolute h-[1px] w-full rotate-12 bg-muted-foreground/60" />
      )}
    </div>
  );
}
