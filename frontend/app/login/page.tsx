"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, getOrCreateSessionId } from "@/lib/api";
import { useCart } from "@/features/cart/CartContext";
import { CartProvider } from "@/features/cart/CartContext";

function LoginPageContent() {
  const router = useRouter();
  const { mergeCart } = useCart();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Authenticate user
        const res = await apiFetch<any>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        // Set token
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Merge cart from guest session
        const sessionId = getOrCreateSessionId();
        await mergeCart(sessionId);

        router.push("/profile");
      } else {
        // Register user
        await apiFetch<any>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        setIsLogin(true);
        setError("Account created successfully. Please login.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="border border-border p-8 bg-white flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isLogin ? "Access your order history and details." : "Join Atelier for custom fashion access."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-xs text-red-500 font-semibold" role="alert">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="uppercase tracking-widest font-semibold text-xs mt-2">
            {isLogin ? "Sign In" : "Register"}
          </Button>
        </form>

        <div className="text-center text-xs mt-2 select-none">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <LoginPageContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
