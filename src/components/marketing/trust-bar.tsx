"use client";

import { motion } from "framer-motion";
import { Clock, Lock, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Lock, label: "Vos vidéos restent privées" },
  { icon: Clock, label: "Résultats en quelques minutes" },
  { icon: ShieldCheck, label: "Aucune carte requise pour essayer" },
];

export function TrustBar() {
  return (
    <div className="border-y border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:gap-10">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-2"
          >
            <item.icon className="size-4 text-brand" />
            {item.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
