"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { CartProvider } from "@/features/cart/CartContext";

// Modular tab component imports
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { BrandsTab } from "@/components/admin/BrandsTab";
import { CollectionsTab } from "@/components/admin/CollectionsTab";
import { CampaignsTab } from "@/components/admin/CampaignsTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { CustomersTab } from "@/components/admin/CustomersTab";
import { ReviewsTab } from "@/components/admin/ReviewsTab";
import { LookbookTab } from "@/components/admin/LookbookTab";
import { CouponsTab } from "@/components/admin/CouponsTab";
import { InventoryTab } from "@/components/admin/InventoryTab";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { MarketingTab } from "@/components/admin/MarketingTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { AuditLogsTab } from "@/components/admin/AuditLogsTab";
import { Search } from "lucide-react";

// Interface definitions
interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending_reviews: number;
  pending_gallery_images: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  is_active: boolean;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
  collections?: { id: string; name: string }[];
  specifications?: Record<string, string>;
  seo_metadata?: { title: string; description: string; keywords: string };
  related_product_ids?: string[];
  images?: { id: string; image_url: string; variant_id: string | null; sort_order: number }[];
  variants?: { id: string; sku: string; color: string; size: string; stock: number; price_override: number | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  desktop_banner_url: string;
  mobile_banner_url: string;
  cta_text?: string;
  cta_link?: string;
  priority: number;
  is_active: boolean;
  badge?: string;
  promotional_copy?: string;
  collection_id?: string | null;
  start_date?: string;
  end_date?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  shipping_address: any;
  items: any[];
}

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  order_count: number;
  total_spend: number;
  created_at: string;
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  status: string;
  is_verified_purchase: boolean;
  created_at: string;
  product?: { name: string };
  user?: { email: string };
}

interface GalleryImage {
  id: string;
  product_id: string;
  image_url: string;
  caption?: string;
  status: string;
  created_at: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  start_date: string;
  expiry_date: string;
  max_uses: number;
  uses_count: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
}

interface UserAccount {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  created_at: string;
}

function AdminContent() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation layout state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Keyboard Command Modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Data lists from APIs
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Status message logs
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states (modals/drawers)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [desktopBannerUrl, setDesktopBannerUrl] = useState("");
  const [mobileBannerUrl, setMobileBannerUrl] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCampaignPreview, setShowCampaignPreview] = useState<Campaign | null>(null);

  // Product Form states
  const [pName, setPName] = useState("");
  const [pSlug, setPSlug] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pShortDescription, setPShortDescription] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pDiscountPrice, setPDiscountPrice] = useState("");
  const [pBrandId, setPBrandId] = useState("");
  const [pCategoryId, setPCategoryId] = useState("");
  const [pCollectionIds, setPCollectionIds] = useState<string[]>([]);
  const [pSpecifications, setPSpecifications] = useState<Record<string, string>>({
    "Fabric": "100% Cotton", "Weight": "200 GSM", "Care": "Machine Wash Cold"
  });
  const [pSeo, setPSeo] = useState({ title: "", description: "", keywords: "" });
  const [pRelated, setPRelated] = useState<string[]>([]);

  // Variant/Image management states
  const [productModalTab, setProductModalTab] = useState("general");
  const [newVColor, setNewVColor] = useState("");
  const [newVSize, setNewVSize] = useState("");
  const [newVSku, setNewVSku] = useState("");
  const [newVStock, setNewVStock] = useState("50");
  const [newVPriceOverride, setNewVPriceOverride] = useState("");

  // Campaign direct products management states
  const [campaignProducts, setCampaignProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchCampaignProductQuery, setSearchCampaignProductQuery] = useState("");
  const [selectedCampaignProductIds, setSelectedCampaignProductIds] = useState<string[]>([]);

  const loadCampaignProducts = async (campaignId: string) => {
    try {
      const prods = await apiFetch<Product[]>(`/admin/campaigns/${campaignId}/products`);
      setCampaignProducts(prods);
    } catch (err) {
      console.error("Failed to load campaign products", err);
    }
  };

  const handleAddProductsToCampaign = async () => {
    if (!editingCampaign) return;
    try {
      setStatusMessage("Adding products to campaign...");
      await apiFetch(`/admin/campaigns/${editingCampaign.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: selectedCampaignProductIds })
      });
      setSelectedCampaignProductIds([]);
      setShowProductSelector(false);
      setStatusMessage("Products added to campaign!");
      await loadCampaignProducts(editingCampaign.id);
    } catch (err: any) {
      alert(err.message || "Failed to add products.");
    }
  };

  const handleRemoveProductFromCampaign = async (productId: string) => {
    if (!editingCampaign) return;
    try {
      setStatusMessage("Removing product from campaign...");
      await apiFetch(`/admin/campaigns/${editingCampaign.id}/products/${productId}`, {
        method: "DELETE"
      });
      setStatusMessage("Product removed from campaign!");
      await loadCampaignProducts(editingCampaign.id);
    } catch (err: any) {
      alert(err.message || "Failed to remove product.");
    }
  };


  const refreshProductDetails = async () => {
    try {
      const list = await apiFetch<Product[]>("/admin/products");
      setProducts(list);
      if (editingProduct) {
        const updatedProduct = list.find(p => p.id === editingProduct.id);
        if (updatedProduct) {
          setEditingProduct(updatedProduct);
        }
      }
    } catch (err) {
      console.error("Failed to refresh product details", err);
    }
  };

  const handleUploadImage = async (file: File, color?: string) => {
    if (!editingProduct) return;
    const formData = new FormData();
    formData.append("file", file);
    
    let url = `/admin/products/${editingProduct.id}/images`;
    if (color) {
      url += `?color=${encodeURIComponent(color)}`;
    }
    
    try {
      setStatusMessage("Uploading image asset...");
      await apiFetch(url, {
        method: "POST",
        body: formData
      });
      setStatusMessage("Image asset uploaded successfully!");
      await refreshProductDetails();
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingProduct) return;
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      setStatusMessage("Deleting image asset...");
      await apiFetch(`/admin/products/${editingProduct.id}/images/${imageId}`, {
        method: "DELETE"
      });
      setStatusMessage("Image asset deleted successfully!");
      await refreshProductDetails();
    } catch (err: any) {
      alert(err.message || "Failed to delete image.");
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setStatusMessage("Adding product variant...");
      await apiFetch(`/admin/products/${editingProduct.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newVSku,
          color: newVColor,
          size: newVSize,
          stock: parseInt(newVStock, 10) || 0,
          price_override: newVPriceOverride ? parseFloat(newVPriceOverride) : null
        })
      });
      setStatusMessage("Product variant added successfully!");
      setNewVSize("");
      setNewVSku("");
      setNewVStock("50");
      setNewVPriceOverride("");
      await refreshProductDetails();
    } catch (err: any) {
      alert(err.message || "Failed to create variant.");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct) return;
    if (!confirm("Are you sure you want to delete this variant? This cannot be undone.")) return;
    try {
      setStatusMessage("Deleting product variant...");
      await apiFetch(`/admin/products/${editingProduct.id}/variants/${variantId}`, {
        method: "DELETE"
      });
      setStatusMessage("Variant deleted successfully!");
      await refreshProductDetails();
    } catch (err: any) {
      alert(err.message || "Failed to delete variant.");
    }
  };

  const handleUpdateVariantStock = async (variantId: string, stock: number) => {
    try {
      await apiFetch(`/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock })
      });
      if (editingProduct) {
        const updatedVariants = editingProduct.variants?.map(v => 
          v.id === variantId ? { ...v, stock } : v
        );
        setEditingProduct({ ...editingProduct, variants: updatedVariants });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update stock.");
    }
  };

  // Authenticate Admin check
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      setError(null);
      try {
        const me = await apiFetch<any>("/auth/me");
        if (me.role !== "admin" && me.role !== "manager") {
          router.push("/profile");
          return;
        }
        setIsAdmin(true);
        setCurrentUser(me);
      } catch (err: any) {
        setError(err.message || "Unauthorized access. Admins only.");
        router.push("/profile");
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch module specific data dynamically
  useEffect(() => {
    if (!isAdmin) return;
    loadModuleData(activeTab);
  }, [activeTab, isAdmin]);

  const loadModuleData = async (tab: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      if (tab === "dashboard") {
        const data = await apiFetch<any>("/admin/dashboard/metrics");
        setMetrics(data.metrics);
        setLowStock(data.low_stock_alerts);
        // Load analytics for mini charts
        const analyticsData = await apiFetch<any>("/admin/analytics");
        setAnalytics(analyticsData);
      } else if (tab === "products") {
        const list = await apiFetch<Product[]>("/admin/products");
        setProducts(list);
        // Load dependencies for dropdowns
        const cats = await apiFetch<Category[]>("/products/categories");
        setCategories(cats);
        const brs = await apiFetch<Brand[]>("/products/brands");
        setBrands(brs);
        const colls = await apiFetch<Collection[]>("/products/collections");
        setCollections(colls);
      } else if (tab === "categories") {
        const list = await apiFetch<Category[]>("/products/categories");
        setCategories(list);
      } else if (tab === "brands") {
        const list = await apiFetch<Brand[]>("/products/brands");
        setBrands(list);
      } else if (tab === "collections") {
        const list = await apiFetch<Collection[]>("/products/collections");
        setCollections(list);
      } else if (tab === "campaigns") {
        const list = await apiFetch<Campaign[]>("/admin/campaigns");
        setCampaigns(list);
        const colls = await apiFetch<Collection[]>("/products/collections");
        setCollections(colls);
      } else if (tab === "orders") {
        const list = await apiFetch<Order[]>("/admin/orders");
        setOrders(list);
      } else if (tab === "customers") {
        const list = await apiFetch<Customer[]>("/admin/customers");
        setCustomers(list);
      } else if (tab === "reviews") {
        const list = await apiFetch<Review[]>("/admin/reviews");
        setReviews(list);
      } else if (tab === "lookbook") {
        const list = await apiFetch<GalleryImage[]>("/admin/gallery");
        setGalleryImages(list);
      } else if (tab === "coupons") {
        const list = await apiFetch<Coupon[]>("/admin/coupons");
        setCoupons(list);
      } else if (tab === "inventory") {
        const list = await apiFetch<InventoryItem[]>("/admin/inventory");
        setInventory(list);
      } else if (tab === "analytics") {
        const data = await apiFetch<any>("/admin/analytics");
        setAnalytics(data);
      } else if (tab === "marketing") {
        const subs = await apiFetch<any[]>("/admin/marketing/subscribers");
        setSubscribers(subs);
      } else if (tab === "users") {
        const list = await apiFetch<UserAccount[]>("/admin/users");
        setUsers(list);
      } else if (tab === "settings") {
        const sets = await apiFetch<any>("/admin/settings");
        setSettings(sets);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load administration resource.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS & API SAVES ---

  const handleUpdateSettings = async (data: any) => {
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      setSettings(res);
      setStatusMessage("Store configurations updated successfully!");
      return res;
    } catch (err: any) {
      alert(err.message || "Failed to update configurations.");
      throw err;
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bodyPayload = {
        name: pName,
        slug: pSlug,
        description: pDescription,
        price: parseFloat(pPrice),
        brand_id: pBrandId || null,
        category_id: pCategoryId || null,
        short_description: pShortDescription || null,
        collection_ids: pCollectionIds,
        specifications: pSpecifications,
        seo_metadata: pSeo,
        related_product_ids: pRelated
      };

      if (editingProduct) {
        await apiFetch(`/admin/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...bodyPayload, is_active: editingProduct.is_active })
        });
        setStatusMessage("Product updated successfully!");
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
        });
        setStatusMessage("Product created successfully!");
      }
      setShowProductModal(false);
      loadModuleData("products");
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    setProductModalTab("general");
    setPName(product.name);
    setPSlug(product.slug);
    setPDescription(product.description);
    setPShortDescription(product.short_description || "");
    setPPrice(String(product.price));
    setPBrandId(product.brand?.id || "");
    setPCategoryId(product.category?.id || "");
    setPCollectionIds(product.collections?.map((c: any) => c.id) || []);
    setPSpecifications(product.specifications || { "Fabric": "", "Weight": "", "Care": "" });
    setPSeo(product.seo_metadata || { title: "", description: "", keywords: "" });
    setPRelated(product.related_product_ids || []);
    setShowProductModal(true);
  };

  const handleNewProductClick = () => {
    setEditingProduct(null);
    setProductModalTab("general");
    setPName("");
    setPSlug("");
    setPDescription("");
    setPShortDescription("");
    setPPrice("");
    setPBrandId(brands[0]?.id || "");
    setPCategoryId(categories[0]?.id || "");
    setPCollectionIds([]);
    setPSpecifications({ "Fabric": "100% GOTS Organic Cotton", "Weight": "220 GSM", "Care": "Cold Wash" });
    setPSeo({ title: "", description: "", keywords: "" });
    setPRelated([]);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
      setStatusMessage("Product soft-deleted successfully!");
      loadModuleData("products");
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      description: fd.get("description"),
      desktop_banner_url: fd.get("desktop_banner_url"),
      mobile_banner_url: fd.get("mobile_banner_url"),
      collection_id: fd.get("collection_id") || null,
      cta_text: fd.get("cta_text"),
      cta_link: fd.get("cta_link"),
      priority: parseInt(fd.get("priority") as string, 10) || 0,
      is_active: fd.get("is_active") === "true",
      badge: fd.get("badge"),
      promotional_copy: fd.get("promotional_copy"),
      start_date: fd.get("start_date") || null,
      end_date: fd.get("end_date") || null
    };

    try {
      if (editingCampaign) {
        await apiFetch(`/admin/campaigns/${editingCampaign.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setStatusMessage("Campaign updated!");
      } else {
        await apiFetch("/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setStatusMessage("Campaign scheduled!");
      }
      setShowCampaignModal(false);
      loadModuleData("campaigns");
    } catch (err: any) {
      alert(err.message || "Failed to save campaign.");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await apiFetch(`/admin/campaigns/${id}`, { method: "DELETE" });
      setStatusMessage("Campaign deleted.");
      loadModuleData("campaigns");
    } catch (err: any) {
      alert(err.message || "Failed to delete campaign.");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = {
      code: fd.get("code"),
      discount_type: fd.get("discount_type"),
      discount_value: parseFloat(fd.get("discount_value") as string),
      min_order_value: parseFloat(fd.get("min_order_value") as string) || 0.0,
      max_uses: parseInt(fd.get("max_uses") as string, 10) || 100,
      start_date: fd.get("start_date"),
      expiry_date: fd.get("expiry_date")
    };
    try {
      await apiFetch("/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setStatusMessage("Coupon generated!");
      setShowCouponModal(false);
      loadModuleData("coupons");
    } catch (err: any) {
      alert(err.message || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: "DELETE" });
      setStatusMessage("Coupon deleted.");
      loadModuleData("coupons");
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon.");
    }
  };

  const handleModerateReview = async (id: string, action: string) => {
    try {
      await apiFetch(`/admin/reviews/${id}/moderate?action=${action}`, { method: "POST" });
      setStatusMessage(`Review ${action}d successfully!`);
      loadModuleData("reviews");
    } catch (err: any) {
      alert(err.message || "Failed to moderate review.");
    }
  };

  const handleModerateGallery = async (id: string, action: string) => {
    try {
      await apiFetch(`/admin/gallery/${id}/moderate?action=${action}`, { method: "POST" });
      setStatusMessage(`Image ${action}d successfully!`);
      loadModuleData("lookbook");
    } catch (err: any) {
      alert(err.message || "Failed to moderate image.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      router.push("/login");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "desktop" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await apiFetch<any>("/admin/media/upload", {
        method: "POST",
        body: formData
      });
      if (target === "desktop") {
        setDesktopBannerUrl(res.url);
      } else {
        setMobileBannerUrl(res.url);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    }
  };

  // Keyboard shortcut command actions mapping
  const COMMAND_SHORTCUTS = [
    { name: "Go to Dashboard", action: () => setActiveTab("dashboard") },
    { name: "Go to Analytics Reports", action: () => setActiveTab("analytics") },
    { name: "Go to Audit Compliance Logs", action: () => setActiveTab("audit") },
    { name: "Go to Products Catalog", action: () => setActiveTab("products") },
    { name: "Go to Categories Management", action: () => setActiveTab("categories") },
    { name: "Go to Brand Partners", action: () => setActiveTab("brands") },
    { name: "Go to Seasonal Collections", action: () => setActiveTab("collections") },
    { name: "Go to Stock Inventory", action: () => setActiveTab("inventory") },
    { name: "Go to Order Fulfillment", action: () => setActiveTab("orders") },
    { name: "Go to Customers profiles", action: () => setActiveTab("customers") },
    { name: "Go to Campaigns Setup", action: () => setActiveTab("campaigns") },
    { name: "Go to Store Settings", action: () => setActiveTab("settings") },
    { name: "Add Catalog Product", action: () => handleNewProductClick() },
    { name: "Generate New Promo Coupon", action: () => { setEditingCampaign(null); setShowCouponModal(true); } },
    { name: "Configure Seasonal Campaign", action: () => { setEditingCampaign(null); setShowCampaignModal(true); } }
  ];

  const filteredShortcuts = COMMAND_SHORTCUTS.filter(cmd => 
    cmd.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (isLoading && activeTab === "dashboard" && !metrics) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-neutral-900 select-none">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
          Atelier security check...
        </div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-neutral-900 p-6 select-none text-center">
        <p className="text-red-500 font-bold text-sm mb-4">⚠️ {error}</p>
        <Button variant="outline" onClick={() => router.push("/login")}>Re-authenticate credentials</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Dynamic Header */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        userEmail={currentUser?.email || "admin@premiumfashion.com"}
        onLogout={handleLogout}
        onSearchClick={() => setShowSearchModal(true)}
        metrics={metrics}
      />

      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Dynamic Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Content Region */}
        <main className="flex-grow p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          
          {statusMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 text-xs font-bold border border-green-200 rounded-sm shadow-2xs select-none">
              ✓ {statusMessage}
            </div>
          )}

          {isLoading ? (
            <div className="py-20 text-center animate-pulse text-xs tracking-widest text-neutral-400 select-none">
              LOADING COMPONENT MODULE...
            </div>
          ) : (
            <div className="fade-in duration-300">
              {activeTab === "dashboard" && metrics && (
                <DashboardTab 
                  metrics={metrics} 
                  lowStock={lowStock} 
                  onNavigateTab={setActiveTab} 
                  analytics={analytics}
                />
              )}

              {activeTab === "products" && (
                <ProductsTab
                  products={products}
                  categories={categories}
                  brands={brands}
                  collections={collections}
                  onEditProductClick={handleEditProductClick}
                  onNewProductClick={handleNewProductClick}
                  onDeleteProduct={handleDeleteProduct}
                  onRefresh={() => loadModuleData("products")}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesTab
                  categories={categories}
                  onEditCategoryClick={(c) => { setEditingCategory(c); setShowCategoryModal(true); }}
                  onNewCategoryClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                  onDeleteCategory={async (id) => {
                    if (confirm("Delete category?")) {
                      await apiFetch(`/admin/categories/${id}`, { method: "DELETE" });
                      setStatusMessage("Category deleted.");
                      loadModuleData("categories");
                    }
                  }}
                />
              )}

              {activeTab === "brands" && (
                <BrandsTab
                  brands={brands}
                  onEditBrandClick={(b) => { setEditingBrand(b); setShowBrandModal(true); }}
                  onNewBrandClick={() => { setEditingBrand(null); setShowBrandModal(true); }}
                  onDeleteBrand={async (id) => {
                    if (confirm("Delete brand?")) {
                      await apiFetch(`/admin/brands/${id}`, { method: "DELETE" });
                      setStatusMessage("Brand deleted.");
                      loadModuleData("brands");
                    }
                  }}
                />
              )}

              {activeTab === "collections" && (
                <CollectionsTab
                  collections={collections}
                  onEditCollectionClick={(c) => { setEditingCollection(c); setShowCollectionModal(true); }}
                  onNewCollectionClick={() => { setEditingCollection(null); setShowCollectionModal(true); }}
                  onDeleteCollection={async (id) => {
                    if (confirm("Delete collection?")) {
                      await apiFetch(`/admin/collections/${id}`, { method: "DELETE" });
                      setStatusMessage("Collection deleted.");
                      loadModuleData("collections");
                    }
                  }}
                />
              )}

              {activeTab === "campaigns" && (
                <CampaignsTab
                  campaigns={campaigns}
                  onEditCampaignClick={(c) => { 
                    setEditingCampaign(c); 
                    setDesktopBannerUrl(c.desktop_banner_url);
                    setMobileBannerUrl(c.mobile_banner_url);
                    loadCampaignProducts(c.id);
                    setShowCampaignModal(true); 
                  }}
                  onNewCampaignClick={() => { 
                    setEditingCampaign(null); 
                    setCampaignProducts([]);
                    setDesktopBannerUrl("/images/banner-fallback.jpg");
                    setMobileBannerUrl("/images/banner-fallback-mobile.jpg");
                    setShowCampaignModal(true); 
                  }}
                  onDeleteCampaign={handleDeleteCampaign}
                  onPreviewCampaign={setShowCampaignPreview}
                />
              )}

              {activeTab === "orders" && (
                <OrdersTab
                  orders={orders}
                  onRefresh={() => loadModuleData("orders")}
                />
              )}

              {activeTab === "customers" && (
                <CustomersTab
                  customers={customers}
                />
              )}

              {activeTab === "reviews" && (
                <ReviewsTab
                  reviews={reviews}
                  onModerateReview={handleModerateReview}
                />
              )}

              {activeTab === "lookbook" && (
                <LookbookTab
                  galleryImages={galleryImages}
                  onModerateGallery={handleModerateGallery}
                />
              )}

              {activeTab === "coupons" && (
                <CouponsTab
                  coupons={coupons}
                  onNewCouponClick={() => setShowCouponModal(true)}
                  onDeleteCoupon={handleDeleteCoupon}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryTab
                  inventory={inventory}
                  onRefresh={() => loadModuleData("inventory")}
                />
              )}

              {activeTab === "analytics" && analytics && (
                <AnalyticsTab
                  analytics={analytics}
                />
              )}

              {activeTab === "marketing" && (
                <MarketingTab
                  subscribers={subscribers}
                  onSendNewsletter={async (subj, cont) => {
                    return await apiFetch("/admin/marketing/newsletter", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subject: subj, content: cont })
                    });
                  }}
                />
              )}

              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  currentUserEmail={currentUser?.email || "admin@premiumfashion.com"}
                  onRefresh={() => loadModuleData("users")}
                />
              )}

              {activeTab === "settings" && settings && (
                <SettingsTab
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}

              {activeTab === "audit" && (
                <AuditLogsTab />
              )}
            </div>
          )}

        </main>
      </div>

      {/* --- COMMAND MODAL KEYBOARD SHORTCUT (stripe-style) --- */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setShowSearchModal(false)} />
          
          <div className="bg-white border rounded-sm max-w-lg w-full shadow-2xl relative z-10 flex flex-col overflow-hidden text-xs text-left animate-scale-up">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Search size={16} className="text-neutral-400" />
              <input
                type="text"
                placeholder="Search commands or tabs..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                autoFocus
                className="w-full border-none focus:outline-none placeholder-neutral-400 font-semibold text-neutral-800"
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-neutral-450 hover:text-black font-semibold text-sm"
              >
                ESC
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-0.5 select-none">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-1 mb-1 block">Quick Navigation shortcuts</span>
              {filteredShortcuts.length === 0 ? (
                <div className="p-4 text-center text-neutral-400 font-medium italic">
                  No matching shortcuts found.
                </div>
              ) : (
                filteredShortcuts.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      setShowSearchModal(false);
                      setSearchFilter("");
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm text-neutral-700 hover:bg-neutral-50 hover:text-black font-semibold tracking-wide flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <span>{cmd.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono font-normal">Action</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MONOLITHIC PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white border rounded-sm max-w-2xl w-full p-6 shadow-2xl relative text-xs text-left">
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none flex justify-between items-center">
              <span>{editingProduct ? "Modify Catalog Product" : "Define Catalog Product"}</span>
              {editingProduct && (
                <span className="text-[10px] text-neutral-400 font-mono font-normal">ID: {editingProduct.id}</span>
              )}
            </h3>

            {/* Tabs Header */}
            {editingProduct && (
              <div className="flex border-b border-secondary mb-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 select-none">
                <button
                  type="button"
                  onClick={() => setProductModalTab("general")}
                  className={`px-4 py-2 border-r ${productModalTab === "general" ? "bg-neutral-50 text-black border-b-2 border-b-black font-bold" : "hover:text-black hover:bg-neutral-50/50"}`}
                >
                  General Details
                </button>
                <button
                  type="button"
                  onClick={() => setProductModalTab("media")}
                  className={`px-4 py-2 ${productModalTab === "media" ? "bg-neutral-50 text-black border-b-2 border-b-black font-bold" : "hover:text-black hover:bg-neutral-50/50"}`}
                >
                  Variants & Media
                </button>
              </div>
            )}

            {productModalTab === "general" ? (
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Product Name</label>
                    <input
                      type="text"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      required
                      className="border p-2 focus:outline-none rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Slug Identifier</label>
                    <input
                      type="text"
                      value={pSlug}
                      onChange={(e) => setPSlug(e.target.value)}
                      required
                      className="border p-2 focus:outline-none rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neutral-700">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    required
                    className="border p-2 focus:outline-none rounded-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neutral-700">Short Summary</label>
                  <input
                    type="text"
                    value={pShortDescription}
                    onChange={(e) => setPShortDescription(e.target.value)}
                    className="border p-2 focus:outline-none rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      required
                      className="border p-2 focus:outline-none rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Discount/Sale Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pDiscountPrice}
                      onChange={(e) => setPDiscountPrice(e.target.value)}
                      className="border p-2 focus:outline-none rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Brand Partner</label>
                    <select
                      value={pBrandId}
                      onChange={(e) => setPBrandId(e.target.value)}
                      className="border p-2 focus:outline-none rounded-sm bg-white"
                    >
                      <option value="">None</option>
                      {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-700">Category Tag</label>
                    <select
                      value={pCategoryId}
                      onChange={(e) => setPCategoryId(e.target.value)}
                      className="border p-2 focus:outline-none rounded-sm bg-white"
                    >
                      <option value="">None</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border p-3 rounded-sm bg-neutral-50/50">
                  <label className="font-bold text-neutral-700 block mb-1">Collections Association (Many-to-Many)</label>
                  <span className="text-[10px] text-neutral-400 block mb-2">Check all collections that apply to this product.</span>
                  <div className="flex flex-wrap gap-4 mt-1">
                    {collections.map((c) => {
                      const isChecked = pCollectionIds.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-600 select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPCollectionIds([...pCollectionIds, c.id]);
                              } else {
                                setPCollectionIds(pCollectionIds.filter(id => id !== c.id));
                              }
                            }}
                            className="rounded-xs accent-black border-neutral-300 w-3.5 h-3.5"
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="border-t pt-4">
                  <span className="font-bold text-neutral-700 block mb-2">Specifications Details</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-500">Fabric Composition</label>
                      <input
                        type="text"
                        value={pSpecifications.Fabric || ""}
                        onChange={(e) => setPSpecifications({ ...pSpecifications, Fabric: e.target.value })}
                        className="border p-2 focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-500">Weight (GSM)</label>
                      <input
                        type="text"
                        value={pSpecifications.Weight || ""}
                        onChange={(e) => setPSpecifications({ ...pSpecifications, Weight: e.target.value })}
                        className="border p-2 focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-500">Care Instructions</label>
                      <input
                        type="text"
                        value={pSpecifications.Care || ""}
                        onChange={(e) => setPSpecifications({ ...pSpecifications, Care: e.target.value })}
                        className="border p-2 focus:outline-none rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO metadata */}
                <div className="border-t pt-4">
                  <span className="font-bold text-neutral-700 block mb-2">Search Engine Optimization (SEO)</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-500">Meta Title</label>
                      <input
                        type="text"
                        value={pSeo.title}
                        onChange={(e) => setPSeo({ ...pSeo, title: e.target.value })}
                        className="border p-2 focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-500">Meta Description</label>
                      <input
                        type="text"
                        value={pSeo.description}
                        onChange={(e) => setPSeo({ ...pSeo, description: e.target.value })}
                        className="border p-2 focus:outline-none rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>Cancel</Button>
                  <Button type="submit">Save Product Details</Button>
                </div>
              </form>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto pr-1 flex flex-col gap-6 scrollbar-thin">
                
                {/* A. GENERAL PRODUCT IMAGES (NON-COLOR SPECIFIC) */}
                <div className="border border-neutral-200 p-4 rounded-sm bg-neutral-50">
                  <span className="font-bold text-neutral-700 block mb-1">General Product Images</span>
                  <span className="text-[10px] text-neutral-400 block mb-3">These images are shown for the product regardless of color choice.</span>
                  
                  {/* Upload zone */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) await handleUploadImage(file);
                    }}
                    className="border-2 border-dashed border-neutral-300 rounded-sm p-4 text-center hover:border-black transition-colors bg-white flex flex-col items-center justify-center cursor-pointer mb-4"
                  >
                    <span className="font-semibold text-neutral-600">Drag & Drop Image Here</span>
                    <span className="text-[10px] text-neutral-400 mt-1">Or click below to browse files</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleUploadImage(file);
                      }} 
                      className="mt-2 text-[10px]" 
                    />
                  </div>

                  {/* Image gallery */}
                  <div className="grid grid-cols-4 gap-3">
                    {editingProduct?.images?.filter(img => !img.variant_id).map(img => (
                      <div key={img.id} className="relative border rounded-sm group overflow-hidden bg-white aspect-square flex items-center justify-center">
                        <img src={`http://localhost:8000${img.image_url}`} alt="Product" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold tracking-widest text-[9px] uppercase transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B. COLOR VARIANTS SECTION */}
                <div>
                  <span className="font-bold text-neutral-700 block mb-3 text-sm">Product Color Variants</span>
                  
                  {/* List of current variants grouped by color */}
                  {(() => {
                    const grouped: Record<string, NonNullable<Product["variants"]>> = {};
                    editingProduct?.variants?.forEach(v => {
                      if (!grouped[v.color]) grouped[v.color] = [];
                      grouped[v.color].push(v);
                    });
                    
                    const colors = Object.keys(grouped);
                    if (colors.length === 0) {
                      return <div className="text-neutral-400 italic text-center py-6 border border-dashed rounded-sm">No variants defined yet. Use the form below to add color variants.</div>;
                    }
                    
                    return colors.map(color => {
                      const colorVariants = grouped[color];
                      const colorVariantIds = colorVariants.map(v => v.id);
                      const colorImages = editingProduct?.images?.filter(img => img.variant_id && colorVariantIds.includes(img.variant_id)) || [];
                      
                      return (
                        <div key={color} className="border border-neutral-200 rounded-sm mb-4 bg-white overflow-hidden shadow-xs">
                          <div className="bg-neutral-900 text-white px-4 py-2 font-bold flex justify-between items-center select-none uppercase tracking-wider text-[10px]">
                            <span>Color: {color}</span>
                            <span>{colorImages.length} Images</span>
                          </div>
                          
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {/* Left Side: Variants sizes and stock levels */}
                            <div className="flex flex-col gap-2">
                              <span className="font-bold text-neutral-600 block border-b pb-1">Sizes & Stock</span>
                              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                                {colorVariants.map(v => (
                                  <div key={v.id} className="flex justify-between items-center border-b border-neutral-50 pb-1 text-[11px]">
                                    <span className="font-mono text-neutral-500">Size: <strong className="text-neutral-900">{v.size}</strong> ({v.sku})</span>
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="number" 
                                        defaultValue={v.stock}
                                        onBlur={(e) => handleUpdateVariantStock(v.id, parseInt(e.target.value, 10) || 0)}
                                        className="w-12 border p-1 rounded-sm text-center font-mono text-[10px]" 
                                        title="Click out to save stock adjustment"
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteVariant(v.id)} 
                                        className="text-red-500 hover:bg-red-50 p-1 rounded-sm font-bold"
                                        title="Delete Variant Size"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right Side: Color-specific drag-and-drop upload and gallery */}
                            <div>
                              <span className="font-bold text-neutral-600 block border-b pb-1 mb-2">Color Media Upload</span>
                              
                              <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={async (e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) await handleUploadImage(file, color);
                                }}
                                className="border border-dashed border-neutral-300 rounded-sm p-3 text-center hover:border-black transition-colors bg-neutral-50 flex flex-col items-center justify-center cursor-pointer mb-2"
                              >
                                <span className="font-semibold text-neutral-500 text-[10px]">Drop {color} Images</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) await handleUploadImage(file, color);
                                  }} 
                                  className="mt-1 text-[9px] w-full" 
                                />
                              </div>

                              {/* Gallery for this color */}
                              <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto">
                                {colorImages.map(img => (
                                  <div key={img.id} className="relative border rounded-sm group overflow-hidden bg-neutral-100 aspect-square flex items-center justify-center">
                                    <img src={`http://localhost:8000${img.image_url}`} alt={color} className="object-cover w-full h-full" />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteImage(img.id)}
                                      className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[8px] uppercase transition-opacity"
                                    >
                                      Del
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* C. ADD NEW VARIANT FORM */}
                <div className="border border-neutral-200 p-4 rounded-sm bg-neutral-50/50">
                  <span className="font-bold text-neutral-700 block mb-3 text-sm">Add New Product Variant</span>
                  <form onSubmit={handleCreateVariant} className="grid grid-cols-5 gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Color</label>
                      <input 
                        type="text" 
                        value={newVColor} 
                        onChange={(e) => setNewVColor(e.target.value)} 
                        placeholder="e.g. Charcoal" 
                        required 
                        className="border p-2 focus:outline-none bg-white rounded-sm" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Size</label>
                      <input 
                        type="text" 
                        value={newVSize} 
                        onChange={(e) => setNewVSize(e.target.value)} 
                        placeholder="e.g. M / XL" 
                        required 
                        className="border p-2 focus:outline-none bg-white rounded-sm" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">SKU Code</label>
                      <input 
                        type="text" 
                        value={newVSku} 
                        onChange={(e) => setNewVSku(e.target.value)} 
                        placeholder="e.g. ZAR-BOO-CHA-M" 
                        required 
                        className="border p-2 focus:outline-none bg-white rounded-sm" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Stock</label>
                      <input 
                        type="number" 
                        value={newVStock} 
                        onChange={(e) => setNewVStock(e.target.value)} 
                        required 
                        className="border p-2 focus:outline-none bg-white rounded-sm" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 rounded-sm text-[10px] h-10 select-none cursor-pointer"
                    >
                      Add Variant
                    </button>
                  </form>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>Close Modal</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MONOLITHIC CAMPAIGN MODAL --- */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className={`bg-white rounded-sm border w-full p-6 shadow-xl text-xs relative ${editingCampaign ? "max-w-4xl" : "max-w-sm"}`}>
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none flex justify-between items-center">
              <span>{editingCampaign ? "Edit Campaign Banner" : "Schedule New Campaign Banner"}</span>
              {editingCampaign && (
                <span className="text-[10px] text-neutral-400 font-mono font-normal">ID: {editingCampaign.id}</span>
              )}
            </h3>
            
            <div className={`grid gap-6 ${editingCampaign ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Column 1: Campaign Details Form */}
              <form onSubmit={handleSaveCampaign} className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Campaign Name</label>
                  <input type="text" name="name" defaultValue={editingCampaign?.name || ""} className="border p-2 focus:outline-none rounded-sm" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Slug ID</label>
                  <input type="text" name="slug" defaultValue={editingCampaign?.slug || ""} className="border p-2 focus:outline-none rounded-sm" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Linked Collection (Solution A)</label>
                  <select name="collection_id" defaultValue={editingCampaign?.collection_id || ""} className="border p-2 focus:outline-none bg-white rounded-sm">
                    <option value="">None</option>
                    {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Promotional Badge text</label>
                  <input type="text" name="badge" defaultValue={editingCampaign?.badge || ""} placeholder="AUTUMN COUTURE" className="border p-2 focus:outline-none rounded-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Primary Promotional Copy</label>
                  <input type="text" name="promotional_copy" defaultValue={editingCampaign?.promotional_copy || ""} className="border p-2 focus:outline-none rounded-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Desktop Banner URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="desktop_banner_url" 
                      value={desktopBannerUrl} 
                      onChange={(e) => setDesktopBannerUrl(e.target.value)}
                      className="border p-2 focus:outline-none flex-grow rounded-sm" 
                      required 
                    />
                    <label className="bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-3 flex items-center justify-center rounded-sm cursor-pointer select-none shrink-0">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "desktop")} 
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Mobile Banner URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="mobile_banner_url" 
                      value={mobileBannerUrl} 
                      onChange={(e) => setMobileBannerUrl(e.target.value)}
                      className="border p-2 focus:outline-none flex-grow rounded-sm" 
                      required 
                    />
                    <label className="bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-3 flex items-center justify-center rounded-sm cursor-pointer select-none shrink-0">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "mobile")} 
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">CTA Text</label>
                    <input type="text" name="cta_text" defaultValue={editingCampaign?.cta_text || "Explore Collection"} className="border p-2 focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">CTA Link target</label>
                    <input type="text" name="cta_link" defaultValue={editingCampaign?.cta_link || "/products"} className="border p-2 focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">Priority Weight</label>
                    <input type="number" name="priority" defaultValue={editingCampaign?.priority || 0} className="border p-2 focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">Status</label>
                    <select name="is_active" defaultValue={editingCampaign?.is_active ? "true" : "false"} className="border p-2 focus:outline-none bg-white rounded-sm">
                      <option value="true">Active (Published)</option>
                      <option value="false">Inactive (Draft)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">Start Date</label>
                    <input type="datetime-local" name="start_date" defaultValue={editingCampaign?.start_date || ""} className="border p-2 focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-neutral-700">End Date</label>
                    <input type="datetime-local" name="end_date" defaultValue={editingCampaign?.end_date || ""} className="border p-2 focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCampaignModal(false)}>Cancel</Button>
                  <Button type="submit">Schedule Campaign</Button>
                </div>
              </form>

              {/* Column 2: Promoted Campaign Products Selector (Only for editingCampaign) */}
              {editingCampaign && (
                <div className="flex flex-col gap-4 border-l pl-6 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin text-left">
                  <div>
                    <span className="font-bold text-neutral-700 block text-sm">Promoted Products (Solution B)</span>
                    <span className="text-[10px] text-neutral-400 block mb-3">Directly assign specific products to this campaign, regardless of their main category or collection.</span>
                    
                    <button
                      type="button"
                      onClick={() => setShowProductSelector(!showProductSelector)}
                      className="bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-sm text-[10px] select-none cursor-pointer"
                    >
                      {showProductSelector ? "Hide Product Selector" : "Add Products to Campaign"}
                    </button>
                  </div>

                  {/* Inline Product Selector Drawer */}
                  {showProductSelector && (
                    <div className="border border-neutral-200 p-3 rounded-sm bg-neutral-50 flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search products by name or SKU..."
                          value={searchCampaignProductQuery}
                          onChange={(e) => setSearchCampaignProductQuery(e.target.value)}
                          className="border p-2 focus:outline-none flex-grow bg-white text-[11px] rounded-sm"
                        />
                      </div>

                      {/* Products Checkbox List */}
                      <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 border p-2 rounded-sm bg-white scrollbar-thin">
                        {products
                          .filter(p => 
                            p.name.toLowerCase().includes(searchCampaignProductQuery.toLowerCase()) || 
                            p.slug.toLowerCase().includes(searchCampaignProductQuery.toLowerCase())
                          )
                          .slice(0, 50) // limit list for smooth UI rendering
                          .map(p => {
                            const isChecked = selectedCampaignProductIds.includes(p.id);
                            const isAlreadyAdded = campaignProducts.some(cp => cp.id === p.id);
                            return (
                              <label key={p.id} className={`flex items-center justify-between p-1.5 rounded-xs border border-neutral-50 text-[10px] ${isAlreadyAdded ? "opacity-60 bg-neutral-50" : "hover:bg-neutral-50 cursor-pointer"}`}>
                                <span className="font-semibold text-neutral-700 flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked || isAlreadyAdded}
                                    disabled={isAlreadyAdded}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCampaignProductIds([...selectedCampaignProductIds, p.id]);
                                      } else {
                                        setSelectedCampaignProductIds(selectedCampaignProductIds.filter(id => id !== p.id));
                                      }
                                    }}
                                    className="rounded-xs accent-black w-3.5 h-3.5"
                                  />
                                  {p.name}
                                </span>
                                <span className="font-mono text-neutral-400">{p.price}$</span>
                              </label>
                            );
                          })}
                      </div>

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setSelectedCampaignProductIds([]); setShowProductSelector(false); }}
                          className="border px-3 py-1.5 rounded-sm hover:bg-neutral-100 font-bold uppercase tracking-wider text-[9px] select-none cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddProductsToCampaign}
                          disabled={selectedCampaignProductIds.length === 0}
                          className="bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm text-[9px] select-none cursor-pointer disabled:opacity-50"
                        >
                          Confirm ({selectedCampaignProductIds.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of currently added products */}
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-neutral-600 block border-b pb-1 text-[10px] uppercase tracking-wider">Active Promoted Items ({campaignProducts.length})</span>
                    
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin">
                      {campaignProducts.length === 0 ? (
                        <div className="text-neutral-400 italic text-center py-6 border border-dashed rounded-sm">No specific products directly pinned to this campaign. Use the button above to add some.</div>
                      ) : (
                        campaignProducts.map(p => (
                          <div key={p.id} className="flex justify-between items-center border border-neutral-100 p-2 rounded-sm hover:shadow-xs transition-shadow">
                            <div className="flex items-center gap-2">
                              {p.images && p.images.length > 0 ? (
                                <img src={`http://localhost:8000${p.images[0].image_url}`} alt={p.name} className="w-8 h-8 object-cover border rounded-xs" />
                              ) : (
                                <div className="w-8 h-8 border rounded-xs bg-neutral-100 flex items-center justify-center text-[8px] font-mono text-neutral-400">IMG</div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-neutral-800 text-[10px]">{p.name}</span>
                                <span className="text-[9px] text-neutral-400 font-mono">Category: {p.category?.name || "None"}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveProductFromCampaign(p.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-sm font-bold"
                              title="Remove Product from Campaign"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DYNAMIC CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border max-w-sm w-full p-6 shadow-xl text-xs text-left">
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none">
              {editingCategory ? "Modify Category parameters" : "Create New Category"}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const payload = {
                name: fd.get("name"),
                slug: fd.get("slug"),
                description: fd.get("description"),
                parent_id: fd.get("parent_id") || null
              };
              if (editingCategory) {
                await apiFetch(`/admin/categories/${editingCategory.id}`, { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              } else {
                await apiFetch("/admin/categories", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              }
              setShowCategoryModal(false);
              loadModuleData("categories");
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Category Name</label>
                <input type="text" name="name" defaultValue={editingCategory?.name || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Slug ID</label>
                <input type="text" name="slug" defaultValue={editingCategory?.slug || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Description</label>
                <input type="text" name="description" defaultValue={editingCategory?.description || ""} className="border p-2 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Parent Category</label>
                <select name="parent_id" defaultValue={editingCategory?.parent_id || ""} className="border p-2 focus:outline-none">
                  <option value="">None (Root Category)</option>
                  {categories.filter(c => !c.parent_id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                <Button type="submit">Save Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DYNAMIC BRAND MODAL --- */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border max-w-sm w-full p-6 shadow-xl text-xs text-left">
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none">
              {editingBrand ? "Modify Brand partner details" : "Add Brand partner"}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const payload = {
                name: fd.get("name"),
                slug: fd.get("slug"),
                description: fd.get("description"),
                logo_url: fd.get("logo_url")
              };
              if (editingBrand) {
                await apiFetch(`/admin/brands/${editingBrand.id}`, { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              } else {
                await apiFetch("/admin/brands", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              }
              setShowBrandModal(false);
              loadModuleData("brands");
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Brand Name</label>
                <input type="text" name="name" defaultValue={editingBrand?.name || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Slug ID</label>
                <input type="text" name="slug" defaultValue={editingBrand?.slug || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Description Summary</label>
                <input type="text" name="description" defaultValue={editingBrand?.description || ""} className="border p-2 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Logo Image Link</label>
                <input type="text" name="logo_url" defaultValue={editingBrand?.logo_url || ""} className="border p-2 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowBrandModal(false)}>Cancel</Button>
                <Button type="submit">Save Brand</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DYNAMIC COLLECTION MODAL --- */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border max-w-sm w-full p-6 shadow-xl text-xs text-left">
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none">
              {editingCollection ? "Modify Seasonal Collection details" : "Introduce Seasonal Collection"}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const payload = {
                name: fd.get("name"),
                slug: fd.get("slug"),
                description: fd.get("description"),
                image_url: fd.get("image_url"),
                start_date: fd.get("start_date") || null,
                end_date: fd.get("end_date") || null
              };
              if (editingCollection) {
                await apiFetch(`/admin/collections/${editingCollection.id}`, { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              } else {
                await apiFetch("/admin/collections", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) });
              }
              setShowCollectionModal(false);
              loadModuleData("collections");
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Collection Name</label>
                <input type="text" name="name" defaultValue={editingCollection?.name || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Slug ID</label>
                <input type="text" name="slug" defaultValue={editingCollection?.slug || ""} className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Description Summary</label>
                <input type="text" name="description" defaultValue={editingCollection?.description || ""} className="border p-2 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowCollectionModal(false)}>Cancel</Button>
                <Button type="submit">Save Collection</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DYNAMIC COUPONS MODAL --- */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border max-w-sm w-full p-6 shadow-xl text-xs text-left">
            <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2 select-none">Generate Promo Coupon</h3>
            
            <form onSubmit={handleCreateCoupon} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Coupon Code</label>
                <input type="text" name="code" placeholder="WELCOME20" className="border p-2 focus:outline-none font-mono" required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Discount Type</label>
                  <select name="discount_type" className="border p-2 focus:outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat ($)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Discount Value</label>
                  <input type="number" step="0.01" name="discount_value" className="border p-2 focus:outline-none font-bold" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Min Order ($)</label>
                  <input type="number" step="0.01" name="min_order_value" defaultValue="0.00" className="border p-2 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Max Uses</label>
                  <input type="number" name="max_uses" defaultValue="100" className="border p-2 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t pt-3">
                <label className="font-semibold text-neutral-700">Start Date</label>
                <input type="datetime-local" name="start_date" className="border p-2 focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Expiry Date</label>
                <input type="datetime-local" name="expiry_date" className="border p-2 focus:outline-none" required />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowCouponModal(false)}>Cancel</Button>
                <Button type="submit">Create Coupon</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CAMPAIGN PREVIEW MODAL --- */}
      {showCampaignPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 text-white max-w-4xl w-full rounded-sm overflow-hidden shadow-2xl relative text-left">
            <button onClick={() => setShowCampaignPreview(null)} className="absolute top-4 right-4 z-50 text-white/70 hover:text-white font-bold text-lg select-none">×</button>
            <div className="relative h-[50vh] bg-neutral-800">
              <img src={showCampaignPreview.desktop_banner_url} alt="desktop banner" className="absolute inset-0 h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 z-20 flex items-center p-8 sm:p-16">
                <div className="max-w-md flex flex-col gap-4 select-none">
                  {showCampaignPreview.badge && (
                    <span className="text-[9px] font-bold tracking-widest bg-white text-black px-2.5 py-0.5 rounded-full w-max">{showCampaignPreview.badge}</span>
                  )}
                  <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">{showCampaignPreview.name}</h2>
                  <p className="text-xs text-white/90 leading-relaxed">{showCampaignPreview.promotional_copy}</p>
                  <div className="mt-2">
                    <button className="bg-white text-black text-[10px] uppercase tracking-widest font-semibold px-6 py-3 rounded-sm">{showCampaignPreview.cta_text || "Shop Campaign"}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-neutral-950 flex justify-between items-center text-xs text-white/70 border-t border-neutral-800 select-none">
              <span>Preview Mode: Live rendering on landing targets.</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { 
                  if (showCampaignPreview) {
                    setEditingCampaign(showCampaignPreview); 
                    setDesktopBannerUrl(showCampaignPreview.desktop_banner_url);
                    setMobileBannerUrl(showCampaignPreview.mobile_banner_url);
                    loadCampaignProducts(showCampaignPreview.id);
                  }
                  setShowCampaignPreview(null); 
                  setShowCampaignModal(true); 
                }} className="text-white border-neutral-700 bg-neutral-800 hover:bg-neutral-700 h-8 px-4 text-[10px] uppercase font-bold">Edit Campaign Settings</Button>
                <Button size="sm" onClick={() => setShowCampaignPreview(null)} className="h-8 px-4 text-[10px] uppercase font-bold">Close Preview</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminPage() {
  return (
    <CartProvider>
      <AdminContent />
    </CartProvider>
  );
}
