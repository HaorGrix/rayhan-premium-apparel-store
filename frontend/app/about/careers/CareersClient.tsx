"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Briefcase, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Position {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const OPEN_POSITIONS: Position[] = [
  {
    title: "Senior Knitwear Designer",
    department: "Design & Creative",
    location: "New York, NY (Soho Office)",
    type: "Full-Time",
    description: "Lead the aesthetic direction of our winter knitwear categories. Requires 5+ years of experience with zero-waste flat-bed knitting machines and extrafine natural yarns.",
  },
  {
    title: "Sustainability Lead",
    department: "Operations & Sourcing",
    location: "New York, NY (Hybrid)",
    type: "Full-Time",
    description: "Oversee fabric traceability audits and life-cycle carbon calculations. Work closely with Italian and Portuguese mills to ensure strict environmental standards.",
  },
  {
    title: "E-commerce Product Manager",
    department: "Technology",
    location: "Remote / New York",
    type: "Full-Time",
    description: "Manage digital shop updates, search relevance, checkout optimizations, and CRM features to deliver an unparalleled luxury user experience.",
  },
  {
    title: "Retail Styling Associate",
    department: "Customer Experience",
    location: "Soho Flagship Store",
    type: "Part-Time / Full-Time",
    description: "Host private fittings and walk-in consultations, curating tailored apparel collections that flatter individual shapes and support slow fashion.",
  },
];

export default function CareersClient() {
  const [selectedJob, setSelectedJob] = useState<Position | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", coverLetter: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", coverLetter: "" });
    }, 1500);
  };

  const closeForm = () => {
    setSelectedJob(null);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-24 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-bold uppercase">
          Join the House
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-light leading-tight tracking-tight">
          Shape the Future of Conscious Luxury
        </h2>
        <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
          At Atelier, we are building a team of thoughtful creatives, designers, developers, and operators. We offer competitive salaries, comprehensive healthcare, professional development budgets, and clothing credits.
        </p>
      </div>

      {/* Workplace Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3 text-left p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Creative Agency</h3>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            We value individual voice and artistic initiative. Teams are given the space to prototype and experiment with designs, fibers, and digital solutions.
          </p>
        </div>
        <div className="space-y-3 text-left p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Ecological Commitment</h3>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            Our commitment isn't just external; we run carbon-neutral workspaces, utilize recycled office materials, and actively volunteer for environmental restorations.
          </p>
        </div>
        <div className="space-y-3 text-left p-8 bg-white border border-neutral-200/50 rounded-sm shadow-xs hover:border-[#d4af37]/35 hover:shadow-md transition-all duration-300">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Inclusive Growth</h3>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            We support our team's continuous education, covering courses in sustainable supply chains, modern web architectures, and advanced textile history.
          </p>
        </div>
      </div>

      {/* Open Roles */}
      <div className="space-y-8 text-left">
        <div className="border-b pb-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">Open Positions</h3>
          <p className="text-[10px] tracking-widest text-[#d4af37] uppercase font-bold mt-2">Current Opportunities at Our Studios</p>
        </div>

        <div className="divide-y divide-neutral-200/60 border border-neutral-200/50 rounded-sm overflow-hidden bg-white shadow-xs">
          {OPEN_POSITIONS.map((job) => (
            <div key={job.title} className="p-6 hover:bg-neutral-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#d4af37]/10 rounded-sm text-[#d4af37]">
                    <Briefcase size={14} />
                  </span>
                  <h4 className="font-serif text-lg font-bold text-neutral-900">{job.title}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 font-medium">
                  <span className="text-[#d4af37] font-semibold">{job.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span>{job.type}</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-2xl pt-1">
                  {job.description}
                </p>
              </div>

              <Button
                onClick={() => setSelectedJob(job)}
                className="uppercase text-[10px] tracking-widest font-bold py-3.5 px-5 h-auto bg-neutral-950 text-white hover:bg-neutral-800 rounded-sm self-start sm:self-center shrink-0 flex items-center gap-1"
              >
                Apply Now <ChevronRight size={12} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Application Drawer Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-sm shadow-xl overflow-hidden border border-neutral-200 flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] tracking-widest text-[#d4af37] uppercase font-bold">
                    Application Form
                  </span>
                  <h4 className="font-serif text-lg font-bold text-neutral-900">
                    {selectedJob.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="p-1 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {isSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full border border-green-100">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-bold text-neutral-900">Application Received</h4>
                      <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto leading-relaxed">
                        Thank you for applying. An operations representative will contact you via email if your skills match our requirements.
                      </p>
                    </div>
                    <Button
                      onClick={closeForm}
                      className="uppercase text-[9px] tracking-widest font-bold py-2.5 px-6 h-auto bg-neutral-950 text-white hover:bg-neutral-850 rounded-sm"
                    >
                      Close Window
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4 text-xs font-semibold text-neutral-800">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 border border-neutral-200 rounded-sm outline-none focus:border-[#d4af37] text-xs font-medium"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 border border-neutral-200 rounded-sm outline-none focus:border-[#d4af37] text-xs font-medium"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="coverLetter" className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                        Cover Letter / Portfolio Link
                      </label>
                      <textarea
                        id="coverLetter"
                        required
                        rows={4}
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full p-3 border border-neutral-200 rounded-sm outline-none focus:border-[#d4af37] text-xs font-medium resize-none"
                        placeholder="Briefly tell us why you are a good fit for Atelier..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full uppercase text-[10px] tracking-widest font-bold py-3.5 h-auto bg-neutral-950 text-white hover:bg-neutral-800 rounded-sm disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? "Submitting Application..." : "Submit Application"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
