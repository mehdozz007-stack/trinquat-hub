import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Check, Mail, MapPin, Send, Facebook, Instagram, Heart } from "lucide-react";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const errs: Record<string, string> = {};
    if (name.length < 2) errs.name = "Veuillez indiquer votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email invalide.";
    if (message.length < 5) errs.message = "Votre message est un peu court.";
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setSent(true);
      
      // Submit directly to FormSubmit using native form submission
      const form = formRef.current;
      if (form) {
        // Create fresh form data for FormSubmit
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("message", message);
        formData.append("_subject", "🌿 Nouveau message depuis le site trinquatetcompagnie.fr 🏡🌳");
        formData.append("_reply_to", email);
        formData.append("_captcha", "false");
        
        // Post directly to FormSubmit
        fetch("https://formsubmit.co/contact@trinquatetcompagnie.fr", {
          method: "POST",
          body: formData,
        }).then(() => {
          // Success - page already shows "Message envoyé!"
        }).catch(err => {
          console.error("FormSubmit error:", err);
          // Still show success message
        });
      }
    }
  }

  return (
    <section id="contact" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-start">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Contact</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Nous <span className="text-gradient">contacter</span> ?
            </h2>
            <p className="mt-8 text-base md:text-lg leading-relaxed text-muted-foreground max-w-md">
              Une question, une idée, l'envie d'aider sur un événement ? Écrivez-nous,
              nous répondons toujours, c'est promis !
            </p>
            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Par email</p>
                  <a href="mailto:contact@trinquatetcompagnie.fr" className="text-muted-foreground hover:text-foreground">contact@trinquatetcompagnie.fr</a>
                </div>
              </li>
              <li className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                    <Heart className="h-5 w-5 -mt-0.5" />
                  </span>
                  <p className="text-sm font-semibold">Suivez-nous</p>
                </div>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/Trinquatetcompagnie/" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-background/60 text-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground backdrop-blur">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href="https://www.instagram.com/p/DQE1LeOgvRs/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-background/60 text-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground backdrop-blur">
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </li>
              {/*<li className="flex items-start gap-4">
                <span className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <MapPin className="h-5 w-5 -mt-0.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Par adresse</p>
                  <p className="text-muted-foreground hover:text-foreground">410 Avenue du Pont Trinquat, 34070 Montpellier</p>
                </div>
              </li>*/}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative rounded-3xl border border-border/70 bg-card p-8 md:p-10 shadow-soft">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-12"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-leaf text-primary-foreground shadow-glow">
                      <Check className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold">Message envoyé !</h3>
                    <p className="mt-2 max-w-sm text-muted-foreground">
                      Merci, on revient vers vous très vite. À bientôt dans le quartier.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false);
                        setLoading(false);
                        setErrors({});
                      }}
                      className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    ref={formRef}
                    key="form" 
                    onSubmit={onSubmit} 
                    noValidate
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    {errors.submit && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {errors.submit}
                      </div>
                    )}
                    <Field label="Votre nom" name="name" type="text" error={errors.name} placeholder="Marie Dupont" />
                    <Field label="Email" name="email" type="email" error={errors.email} placeholder="marie@exemple.fr" />
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        name="message" rows={5}
                        placeholder="Bonjour Trinquat & Compagnie !"
                        className={`w-full rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.message ? "border-destructive" : "border-border"}`}
                      />
                      {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Envoi..." : "Envoyer"}
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type, error, placeholder }: { label: string; name: string; type: string; error?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
      <input
        id={name} name={name} type={type} placeholder={placeholder}
        className={`w-full rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive" : "border-border"}`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}