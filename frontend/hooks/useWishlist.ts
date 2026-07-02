"use client";

import { useState, useEffect } from "react";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        setTimeout(() => {
          try {
            setWishlist(JSON.parse(stored));
          } catch {
            setWishlist([]);
          }
        }, 0);
      }
    }
  }, []);

  const saveWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      saveWishlist(wishlist.filter((id) => id !== productId));
    } else {
      saveWishlist([...wishlist, productId]);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
  };
}
export default useWishlist;
