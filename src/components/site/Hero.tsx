import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowRight, Calendar, Facebook, Instagram, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero-bg.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.4]);

  return (
    <section id="home" ref={ref} className="relative isolate min-h-dvh overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img
          src={hero}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/30 to-background" />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/15 via-transparent to-transparent" />
      </motion.div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-primary/40"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div style={{ opacity }} className="relative mx-auto flex min-h-dvh max-w-6xl flex-col items-center rounded-xl justify-center px-6 pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 relative"
        >
          <img
            src={logo}
            alt="Trinquat & Compagnie"
            className="h-32 w-auto md:h-34 lg:h-42 rounded-xl drop-shadow-[0_10px_40px_rgba(103,176,33,0.25)]"
          />
          <div className="absolute -right-4 -bottom-4 flex flex-col gap-3">
            {[Facebook, Instagram].map((Icon, i) => (
              <a key={i} href="#" aria-label="Réseau social"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-background/60 text-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground backdrop-blur">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary-deep backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Association d'habitants
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mt-6 text-5xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.05] text-foreground"
        >
          Le quartier <span className="italic text-gradient">se vit</span>
          <br /> ensemble.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          Trinquat & Compagnie rassemble les familles et voisins autour d'événements,
          d'entraide et de moments simples. Une communauté vivante, à l'ombre des grands arbres.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/association"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            Découvrir l'association
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/evenements"
            className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-background"
          >
            <Calendar className="h-4 w-4" />
            Voir les événements
          </Link>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background" />
    </section>
  );
}