"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

/** Shared scroll-triggered fade-up wrapper for marketing sections. */
export function Reveal({ delay = 0, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
