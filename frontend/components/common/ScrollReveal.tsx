"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  yOffset = 30,
  xOffset = 0,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Luxury cubic-bezier ease out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
