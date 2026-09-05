"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Dollar {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  drift: number;
}

function generateDollars(count: number): Dollar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 10 + Math.random() * 10,
    delay: Math.random() * 10,
    size: 18 + Math.random() * 26,
    drift: (Math.random() - 0.5) * 80,
  }));
}

/**
 * Purely decorative floating "$" signs behind the hero. Generated
 * client-side after mount (not during render) so the random positions
 * never mismatch between server and client HTML — SSR would otherwise hit
 * a hydration error since Math.random() differs on each render.
 */
export function FloatingDollars() {
  const [dollars, setDollars] = useState<Dollar[] | null>(null);

  useEffect(() => {
    setDollars(generateDollars(16));
  }, []);

  if (!dollars) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {dollars.map((d) => (
        <motion.span
          key={d.id}
          className="absolute font-black text-brand/25"
          style={{ left: `${d.left}%`, fontSize: d.size, bottom: -60 }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: "-130vh",
            x: d.drift,
            opacity: [0, 1, 1, 0],
            rotate: [0, 12, -12, 0],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          $
        </motion.span>
      ))}
    </div>
  );
}
