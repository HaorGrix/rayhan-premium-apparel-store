"use client";

import React, { useState } from "react";
import { Search, Eye, Printer, Calendar, ArrowRight, ShieldCheck, Truck, Package, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  discount_applied: number;
  sku?: string;
  name?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  shipping_address: any;
  items: OrderItem[];
}

interface OrdersTabProps {
  orders: Order[];
  onRefresh: () => void;
}

export function OrdersTab({ orders, onRefresh }: OrdersTabProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<Order | null>(null);

  // Filters logic
  const filteredOrders = orders.filter(o => {
    const searchLower = search.toLowerCase();
    const matchesSearch = o.order_number.toLowerCase().includes(searchLower) ||
                          o.shipping_address?.email?.toLowerCase().includes(searchLower) ||
                          o.shipping_address?.first_name?.toLowerCase().includes(searchLower) ||
                          o.shipping_address?.last_name?.toLowerCase().includes(searchLower);
                          
    const matchesStatus = selectedStatus === "all" || o.status.toLowerCase() === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/admin/orders/${orderId}/status?status=${newStatus}`, { method: "PATCH" });
      onRefresh();
      // If currently displaying this drawer, update local status
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "pending":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* 1. FILTER CONTROLS TOOLBAR */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none shadow-xs">
        
        {/* Search */}
        <div className="flex items-center gap-3 px-3 py-2 border border-neutral-200 rounded-sm w-full sm:max-w-md focus-within:border-black transition-colors">
          <Search size={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search order number, client name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
            aria-label="Search orders"
          />
        </div>

        {/* Status filters list */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border select-none transition-all cursor-pointer ${
                selectedStatus === status
                  ? "bg-black border-black text-white"
                  : "bg-transparent border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* 2. ORDERS LIST TABLE */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                <th className="p-4">Order Code</th>
                <th className="p-4">Placed Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-medium">
                    No orders matching search or status constraints.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-mono font-bold text-neutral-800">{o.order_number}</td>
                    <td className="p-4 font-mono text-neutral-400 font-semibold">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-neutral-900 block">
                        {o.shipping_address?.first_name} {o.shipping_address?.last_name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                        {o.shipping_address?.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold border ${getStatusStyle(o.status)}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-neutral-950">{formatCurrency(o.grand_total)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                          title="View order workflow drawer"
                          aria-label={`View order ${o.order_number}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setShowPrintModal(o)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                          title="Print order invoice"
                          aria-label={`Print invoice for order ${o.order_number}`}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ORDER DETAILS TIMELINE LOG DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between text-xs animate-slide-in">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 select-none">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order Details</span>
              <h3 className="font-serif text-base font-bold text-neutral-900">{selectedOrder.order_number}</h3>
            </div>
            <button 
              onClick={() => setSelectedOrder(null)}
              className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-md transition-colors"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 text-left">
            
            {/* Status modifier dropdown */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Fulfillment Status</span>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                className="border border-neutral-200 p-2.5 text-xs focus:outline-none rounded-sm bg-transparent font-bold"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Timeline logs */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Fulfillment Timeline Logs</span>
              <div className="flex flex-col gap-4 border-l border-neutral-200 pl-4 ml-2 mt-2">
                
                {/* Event 1 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 bg-green-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-neutral-900">Order Placed</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Event 2 */}
                {selectedOrder.status !== "pending" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 bg-green-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-neutral-900">Payment Captured & Processing</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Captured via Stripe</span>
                    </div>
                  </div>
                )}

                {/* Event 3 */}
                {(selectedOrder.status === "shipped" || selectedOrder.status === "delivered") && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 bg-blue-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-neutral-900">Shipment Dispatched</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Carrier: SteadFast Carrier</span>
                    </div>
                  </div>
                )}

                {/* Event 4 */}
                {selectedOrder.status === "delivered" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 bg-green-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-neutral-900">Order Delivered</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Signed at Destination</span>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "cancelled" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 bg-red-600 w-2.5 h-2.5 rounded-full ring-4 ring-white" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-neutral-900">Order Cancelled</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Reverted stock allocations</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Line items list */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Ordered Articles</span>
              <div className="border border-neutral-100 rounded-sm divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                      <span className="font-bold text-neutral-900 truncate">{item.name || "Catalog Product"}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">SKU: {item.sku || "N/A"}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-800">{formatCurrency(item.unit_price)}</span>
                      <span className="text-[10px] text-neutral-400 block font-mono">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address snapshot */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Shipping Address Snapshot</span>
              <div className="bg-neutral-50 p-4 border border-neutral-150 rounded-sm font-semibold flex flex-col gap-1 text-neutral-700">
                <span className="font-bold text-neutral-900">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</span>
                <span>{selectedOrder.shipping_address?.address_line1}</span>
                <span>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</span>
                <span>{selectedOrder.shipping_address?.country}</span>
                <span className="font-mono text-[10px] text-neutral-400 mt-1">phone: {selectedOrder.shipping_address?.phone}</span>
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2 select-none">
            <button
              onClick={() => { setShowPrintModal(selectedOrder); setSelectedOrder(null); }}
              className="w-full py-3 px-4 border border-neutral-200 hover:border-black text-neutral-700 hover:text-black bg-white font-bold uppercase tracking-wider rounded-sm cursor-pointer text-center"
            >
              Print Invoice
            </button>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 px-4 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-wider rounded-sm cursor-pointer text-center"
            >
              Close Drawer
            </button>
          </div>

        </div>
      )}

      {/* 4. PRINT INVOICE MODAL (Triggered when print icon is clicked) */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:h-auto">
          <div className="bg-white border rounded-sm max-w-2xl w-full p-8 shadow-2xl flex flex-col gap-6 text-xs text-left print:border-none print:shadow-none print:p-0">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-6 select-none print:flex">
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">ATELIER EDITORIAL</h2>
                <span className="font-mono text-[10px] text-neutral-400">PREMIUM FASHION & APPAREL APIS</span>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="font-bold text-sm text-neutral-900">INVOICE</span>
                <span className="font-mono font-bold text-neutral-700">Order: {showPrintModal.order_number}</span>
                <span className="text-[10px] text-neutral-400 font-mono">Date: {new Date(showPrintModal.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Billing vs Shipping layout */}
            <div className="grid grid-cols-2 gap-6 font-semibold text-neutral-600">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Seller Details</span>
                <span className="font-bold text-neutral-900">Atelier Boutique Inc.</span>
                <span>123 Couture Fashion Avenue</span>
                <span>New York, NY 10001</span>
                <span>United States</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Deliver To</span>
                <span className="font-bold text-neutral-900">{showPrintModal.shipping_address?.first_name} {showPrintModal.shipping_address?.last_name}</span>
                <span>{showPrintModal.shipping_address?.address_line1}</span>
                <span>{showPrintModal.shipping_address?.city}, {showPrintModal.shipping_address?.state} {showPrintModal.shipping_address?.postal_code}</span>
                <span>{showPrintModal.shipping_address?.country}</span>
              </div>
            </div>

            {/* Articles Details Table */}
            <div className="border border-neutral-200 rounded-sm overflow-hidden mt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                    <th className="p-3">Article Description</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {showPrintModal.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{item.name || "Fashion Product"}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">SKU: {item.sku || "N/A"}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-neutral-700">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-neutral-700">{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right font-mono font-bold text-neutral-900">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Total block */}
            <div className="flex justify-end mt-4">
              <div className="w-56 flex flex-col gap-2 border-t pt-4 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="font-mono text-neutral-700">{formatCurrency(showPrintModal.grand_total * 0.92)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Estimated Tax (8%)</span>
                  <span className="font-mono text-neutral-700">{formatCurrency(showPrintModal.grand_total * 0.08)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-sm text-neutral-900">
                  <span>Grand Total</span>
                  <span className="font-serif">{formatCurrency(showPrintModal.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer note */}
            <div className="text-[10px] text-neutral-400 font-medium text-center border-t pt-6 select-none">
              Thank you for shopping at Atelier Premium Fashion. For return policies, check our Terms of Service.
            </div>

            {/* Print Modal Buttons */}
            <div className="flex justify-end gap-2 mt-4 print:hidden select-none">
              <Button onClick={handlePrint} className="text-xs uppercase tracking-wider font-bold">
                <Printer size={14} className="mr-1.5" /> Trigger System Print
              </Button>
              <Button variant="outline" onClick={() => setShowPrintModal(null)} className="text-xs uppercase tracking-wider font-bold">
                Close Invoice
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
