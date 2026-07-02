"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { apiFetch, getOrCreateSessionId, ApiError } from "@/lib/api";

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  sku: string;
  name: string;
  color?: string;
  size?: string;
  stock?: number;
  image_url?: string;
  material?: string;
}

export interface Cart {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeCart: (guestSessionId: string) => Promise<void>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  selectedVariantIds: string[];
  setSelectedVariantIds: (ids: string[] | ((prev: string[]) => string[])) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const pathname = usePathname();

  const getSessionId = () => {
    return getOrCreateSessionId();
  };

  const refreshCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Cart>("/cart");
      setCart(data);
      if (data && data.items) {
        setSelectedVariantIds(prev => {
          if (prev.length === 0) {
            return data.items.map(i => i.variant_id);
          }
          const validVariantIds = data.items.map(i => i.variant_id);
          return prev.filter(id => validVariantIds.includes(id));
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load shopping cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    setError(null);
    try {
      const data = await apiFetch<Cart>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
      setCart(data);
    } catch (err: any) {
      setError(err.message || "Failed to add item to cart.");
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setError(null);
    try {
      const data = await apiFetch<Cart>(`/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      setCart(data);
    } catch (err: any) {
      setError(err.message || "Failed to update item quantity.");
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    setError(null);
    try {
      const data = await apiFetch<Cart>(`/cart/items/${itemId}`, {
        method: "DELETE",
      });
      setCart(data);
      // Remove variant from selection if it was deleted
      setSelectedVariantIds(prev => {
        const deletedItem = cart?.items.find(i => i.id === itemId);
        if (deletedItem) {
          return prev.filter(id => id !== deletedItem.variant_id);
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.message || "Failed to remove item from cart.");
      throw err;
    }
  };

  const mergeCart = async (guestSessionId: string) => {
    setError(null);
    try {
      const data = await apiFetch<Cart>(`/cart/merge?guest_session_id=${guestSessionId}`, {
        method: "POST",
      });
      setCart(data);
    } catch (err: any) {
      console.error("Cart merge failed:", err);
    }
  };

  // Restore saved items when navigating away from checkout page
  const restoreSavedItems = async () => {
    if (typeof window === "undefined" || pathname === "/checkout") return;
    const savedStr = localStorage.getItem("saved_cart_items");
    if (!savedStr) return;
    localStorage.removeItem("saved_cart_items");
    try {
      setIsLoading(true);
      const saved = JSON.parse(savedStr);
      if (Array.isArray(saved) && saved.length > 0) {
        for (const item of saved) {
          await apiFetch<Cart>("/cart/items", {
            method: "POST",
            body: JSON.stringify({ variant_id: item.variant_id, quantity: item.quantity }),
          });
        }
        const data = await apiFetch<Cart>("/cart");
        setCart(data);
        // Default to select all restored items
        setSelectedVariantIds(data.items.map(i => i.variant_id));
      }
    } catch (e) {
      console.error("Failed to restore saved items:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    setTimeout(() => {
      refreshCart();
    }, 0);
  }, []);

  // Trigger restore on navigation pathname changes
  useEffect(() => {
    restoreSavedItems();
  }, [pathname]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        mergeCart,
        isDrawerOpen,
        setIsDrawerOpen,
        selectedVariantIds,
        setSelectedVariantIds,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
