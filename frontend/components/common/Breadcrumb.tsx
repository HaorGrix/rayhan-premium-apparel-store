"use client";

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 py-4 text-[10px] font-bold uppercase tracking-widest select-none ${className}`}
    >
      {/* Default Home root link */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
        >
          Home
        </Link>
      </div>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {/* Clean angle separator */}
            <span className="text-muted-foreground/60 font-semibold text-[11px] mx-0.5 select-none">&rsaquo;</span>
            
            <div className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground/90 font-extrabold" aria-current="page">
                  {item.label}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
