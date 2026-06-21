import { useState } from "react";
import { Reveal } from "./Reveal";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { Send, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

const easeCustom = cubicBezier(0.22, 1, 0.36, 1);
const easeBounce = cubicBezier(0.34, 1.56, 0.64, 1);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeCustom },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6, ease: easeBounce },
  },
};

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Erreur lors de l'inscription.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage("Erreur serveur. Veuillez réessayer.");
    }
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.06]" />
      <div className="absolute inset-0 -z-10 grain" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-leaf opacity-10 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-primary-soft opacity-30 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center text-center px-8 py-14 md:px-16 md:py-20">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center py-12"
                  >
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-leaf text-primary-foreground shadow-glow"
                    >
                      <CheckCircle2 className="h-7 w-7" />
                    </motion.div>
                    <motion.h3
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-6 text-3xl font-semibold"
                    >
                      Newsletter <span className="text-gradient">confirmée</span>
                    </motion.h3>
                    <motion.p
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-2 max-w-sm text-muted-foreground"
                    >
                      Merci pour votre inscription. Vous recevrez bientôt nos actualités et nos événements.
                    </motion.p>
                    <motion.button
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStatus("idle");
                        setEmail("");
                        setMessage("");
                        setConsent(false);
                      }}
                      className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      S'inscrire à nouveau
                    </motion.button>
                  </motion.div>
                ) : status === "error" ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center py-12"
                  >
                    <motion.div
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-soft"
                    >
                      <AlertCircle className="h-7 w-7" />
                    </motion.div>
                    <motion.h3
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-6 text-2xl font-semibold"
                    >
                      Oups, une erreur
                    </motion.h3>
                    <motion.p
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="mt-2 max-w-sm text-muted-foreground"
                    >
                      {message}
                    </motion.p>
                    <motion.button
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStatus("idle");
                        setMessage("");
                        setConsent(false);
                      }}
                      className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      Réessayer
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center w-full"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: easeCustom }}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft mb-8"
                    >
                      <Mail className="h-6 w-6" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1]"
                    >
                      Restez <span className="text-gradient">informé·e</span>
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mt-5 max-w-lg text-sm md:text-lg leading-relaxed text-muted-foreground"
                    >
                      Recevez chaque mois les actualités du quartier, les prochains événements
                      et les coulisses de l'association directement dans votre boîte mail.
                    </motion.p>

                    <motion.form
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-10 w-full max-w-md"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.fr"
                            className="w-full rounded-full border border-border/70 bg-background/80 pl-11 pr-5 py-3.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          disabled={status !== "idle" || !email.trim() || !consent}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-leaf px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4" />
                          {status === "loading" ? "Inscription..." : "S'inscrire"}
                        </motion.button>
                      </div>
                      
                      <label className="flex items-start gap-3 cursor-pointer text-left">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-1.5 h-4 w-4 rounded border border-border/70 bg-background cursor-pointer accent-primary shrink-0"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          J'accepte de recevoir les actualités et événements de Trinquat & Compagnie. Je peux me désinscrire à tout moment.
                        </span>
                      </label>
                    </motion.form>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-4 text-xs text-muted-foreground/70"
                    >
                      Pas de spam, promis.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
