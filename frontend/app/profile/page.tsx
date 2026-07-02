"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { CartProvider } from "@/features/cart/CartContext";

interface Order {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await apiFetch<UserProfile>("/auth/me");
        setUser(profile);

        const ordersList = await apiFetch<Order[]>("/orders");
        setOrders(ordersList);
      } catch (err: any) {
        setError(err.message || "Failed to load profile details.");
        // If unauthorized, clear storage
        if (err.message?.includes("auth") || err.message?.includes("login")) {
          localStorage.clear();
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse uppercase text-xs tracking-widest select-none">
        Loading Profile Details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-20 text-center select-none">
        <p className="text-red-500 font-medium mb-4">{error || "User details unavailable."}</p>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="uppercase tracking-wider font-semibold">
          Sign In Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      {/* Account Info Sidebar */}
      <div className="border border-border p-6 bg-white flex flex-col gap-4 h-fit select-none">
        <h2 className="font-serif text-lg font-bold border-b border-secondary pb-3">My Account</h2>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground uppercase font-bold tracking-wider">Name</span>
          <span className="text-foreground font-semibold text-sm capitalize">{user.first_name} {user.last_name}</span>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground uppercase font-bold tracking-wider">Email</span>
          <span className="text-foreground font-semibold text-sm">{user.email}</span>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground uppercase font-bold tracking-wider">Role</span>
          <span className="text-foreground font-semibold text-sm capitalize">{user.role}</span>
        </div>
        
        {user.role === "admin" && (
          <Link href="/admin" className="w-full mt-2">
            <Button variant="outline" className="w-full uppercase text-xs tracking-wider font-semibold">
              Go to Admin Dashboard
            </Button>
          </Link>
        )}

        <Button onClick={handleSignOut} className="uppercase tracking-widest font-semibold text-xs mt-4">
          Sign Out
        </Button>
      </div>

      {/* Orders History Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="border border-secondary bg-white p-12 text-center select-none">
            <p className="text-xs text-muted-foreground leading-relaxed">
              You haven't placed any orders yet. Once you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border p-5 bg-white flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-foreground tracking-wider uppercase">Order: {order.order_number}</span>
                  <span className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="text-muted-foreground capitalize mt-1">Status: <strong className="text-foreground">{order.status}</strong></span>
                </div>
                <div className="flex flex-col items-start sm:items-end justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(Number(order.grand_total))}
                  </span>
                  <Link href={`/profile/orders/${order.id}`} className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 mt-2">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

import Link from "next/link";

export default function ProfilePage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <ProfileContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
