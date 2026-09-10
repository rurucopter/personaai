"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Video, Zap } from "lucide-react";

const STATS = [
  {
    icon: Video,
    value: 12547,
    suffix: "",
    label: "Vidéos générées",
    description: "et ça augmente chaque jour",
  },
  {
    icon: Users,
    value: 4200,
    suffix: "+",
    label: "Créateurs actifs",
    description: "sur la plateforme",
  },
  {
    icon: TrendingUp,
    value: 2.1,
    suffix: "M",
    label: "Vues cumulées",
    description: "sur les réseaux sociaux",
    decimals: 1,
  },
  {
    icon: Zap,
    value: 98,
    suffix: "%",
    label: "Satisfaction",
    description: "taux de recommandation",
  },
];

function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
  trigger,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  trigger: boolean;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [trigger, value]);

  const formatted =
    decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed).toLocaleString("fr-FR");

  return (
    <span className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center gap-1 px-4 py-10 text-center sm:px-6"
          >
            <stat.icon className="mb-2 size-5 text-brand" />
            <span className="text-3xl font-black tracking-tight sm:text-4xl">
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                decimals={(stat as { decimals?: number }).decimals ?? 0}
                trigger={inView}
              />
            </span>
            <span className="text-sm font-medium">{stat.label}</span>
            <span className="text-xs text-muted-foreground">
              {stat.description}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
