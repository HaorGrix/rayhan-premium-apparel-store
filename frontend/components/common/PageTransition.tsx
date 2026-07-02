"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex-grow flex flex-col min-h-full"
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
