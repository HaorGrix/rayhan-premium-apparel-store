"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Mail, Phone, Clock, MapPin, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/features/cart/CartContext";

interface FAQItem {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Order Status",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How long does shipping and delivery take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping options are available at checkout and deliver within 1-2 business days. International deliveries generally arrive within 7-14 business days depending on customs processing times."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer complimentary 30-day returns and exchanges for all unworn, unwashed items in their original packaging with tags attached. Simply initiate your return via our online return portal, print the shipping label, and drop it off at any parcel collection point."
    },
    {
      question: "How do I choose the correct clothing size?",
      answer: "Each item page contains a detailed 'Size & Fits' guide. Since our contemporary silhouettes range from relaxed to slim-fit cuts, we recommend comparing your body measurements with our product specifications. For personalized sizing advice, feel free to contact our customer care team."
    },
    {
      question: "Do you offer styling consultations or custom alterations?",
      answer: "Yes, ATELIER offers complimentary virtual styling consultations. You can book a 30-minute video session with our styling advisors to curate your wardrobe. However, we do not perform in-house product alterations at this time."
    },
    {
      question: "Are your apparel items sustainably sourced?",
      answer: "Sustainability and conscious production are at the heart of ATELIER. Over 85% of our fabrics are certified organic, recycled, or responsibly harvested (such as Merino wool, organic cotton, and linen). We partner exclusively with ethical manufacturers who guarantee fair wages and safe working conditions."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "Order Status", message: "" });
    }, 1200);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between font-sans">
        <Header />

        <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 text-neutral-800">
          {/* Page Title Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] tracking-[0.25em] font-bold text-neutral-400 uppercase select-none">Atelier Assistance</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-2">Customer Care & Support</h1>
            <div className="h-0.5 w-12 bg-black mx-auto mt-4 mb-4 select-none" />
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Have a question regarding your order, styling suggestions, or sustainability standards? Speak directly to our Atelier concierges.
            </p>
          </div>

          {/* Support Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Column 1: Contact Cards & Form (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-8 text-left">
              
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-200/60 p-4 rounded-sm bg-white flex flex-col gap-2">
                  <span className="text-neutral-400"><Mail size={16} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Email Concierge</span>
                  <a href="mailto:care@atelier.com" className="text-xs font-semibold text-neutral-900 hover:underline">care@atelier.com</a>
                </div>
                <div className="border border-neutral-200/60 p-4 rounded-sm bg-white flex flex-col gap-2">
                  <span className="text-neutral-400"><Phone size={16} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Call Support</span>
                  <a href="tel:+18005550199" className="text-xs font-semibold text-neutral-900 hover:underline">+1 (800) 555-0199</a>
                </div>
                <div className="border border-neutral-200/60 p-4 rounded-sm bg-white flex flex-col gap-2">
                  <span className="text-neutral-400"><Clock size={16} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Active Hours</span>
                  <span className="text-xs font-semibold text-neutral-900">Mon-Fri: 9AM - 6PM EST</span>
                </div>
                <div className="border border-neutral-200/60 p-4 rounded-sm bg-white flex flex-col gap-2">
                  <span className="text-neutral-400"><MapPin size={16} /></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">Headquarters</span>
                  <span className="text-xs font-semibold text-neutral-900">120 Atelier Blvd, New York</span>
                </div>
              </div>

              {/* Support Request Form */}
              <div className="border border-neutral-200/60 p-6 rounded-sm bg-white shadow-xs">
                <h3 className="font-serif text-lg font-bold text-neutral-900 mb-4">Send a Message</h3>
                
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <CheckCircle2 size={40} className="text-emerald-500 stroke-[1.5] animate-bounce" />
                    <h4 className="font-bold text-neutral-800 text-sm">Message Sent Successfully</h4>
                    <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                      Thank you for reaching out. An Atelier support concierge will review your message and reply via email within 24 business hours.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4 text-[10px] uppercase tracking-widest font-bold px-6"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-700">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Doe" 
                        className="border p-2 focus:outline-none focus:border-black rounded-sm bg-neutral-50/50" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-700">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane.doe@example.com" 
                        className="border p-2 focus:outline-none focus:border-black rounded-sm bg-neutral-50/50" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-700">Topic of Inquiry</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="border p-2 focus:outline-none focus:border-black rounded-sm bg-white"
                      >
                        <option value="Order Status">Order Status & Tracking</option>
                        <option value="Returns & Refund">Returns & Refund Requests</option>
                        <option value="Size Inquiry">Sizing / Fit Consultation</option>
                        <option value="Styling Advice">Virtual Styling Appointments</option>
                        <option value="Other">Other General Inquiries</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-700">Your Message</label>
                      <textarea 
                        required 
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message here..." 
                        className="border p-2 focus:outline-none focus:border-black rounded-sm bg-neutral-50/50 resize-none" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full uppercase text-[10px] tracking-widest font-bold py-4 h-auto bg-black text-white hover:bg-neutral-800 rounded-sm disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? "Submitting Inquiry..." : "Submit Message"}
                    </Button>
                  </form>
                )}
              </div>

            </div>

            {/* Column 2: Accordion FAQs (7 Cols) */}
            <div id="faqs" className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="border-b pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mt-1">General FAQ & Self Service Help</p>
              </div>

              {/* Accordion List */}
              <div className="flex flex-col border border-neutral-200/60 rounded-sm bg-white overflow-hidden shadow-xs">
                {faqs.map((faq, index) => {
                  const isOpen = openFAQIndex === index;
                  return (
                    <div key={index} className="border-b last:border-b-0 border-neutral-200/60">
                      <button
                        type="button"
                        onClick={() => toggleFAQ(index)}
                        className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className="font-bold text-neutral-800 text-xs sm:text-sm">{faq.question}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${isOpen ? "rotate-180 text-black" : ""}`} 
                        />
                      </button>
                      
                      {/* Collapsible Content */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 border-t border-neutral-100 bg-neutral-50/30" : "max-h-0"}`}
                      >
                        <div className="p-5 text-xs text-neutral-500 leading-relaxed text-left">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}
