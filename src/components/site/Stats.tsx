import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

const stats = [
  { value: 240, suffix: "+", label: "Familles adhérentes" },
  { value: 38, suffix: "", label: "Événements / an" },
  { value: 72, suffix: "", label: "Bénévoles actifs" },
  { value: 12, suffix: " ans", label: "D'aventure collective" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="relative py-24 md:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Le quartier en chiffres</span>
          <h2 className="mt-6 text-4xl md:text-5xl font-medium leading-tight">
            Une <span className="italic text-primary">communauté vivante</span> qui grandit chaque saison.
          </h2>
        </motion.div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
              className="border-t border-background/15 pt-8"
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-3 text-sm text-background/70">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}