"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import type { SiteContent } from "@/lib/content/types";

const ROTATING = ["forge", "animate", "build", "imagine"];

// ── Floating-label field ───────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  rows?: number;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function FloatField({ id, label, type = "text", rows, value, onChange, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="relative rounded-xl border bg-white/[0.03] px-4 pb-2.5 pt-6 transition-all duration-300"
        style={{
          borderColor: focused ? "rgba(255,106,44,0.7)" : "rgba(255,255,255,0.10)",
          boxShadow: focused ? "0 0 0 3px rgba(255,106,44,0.12), 0 0 22px rgba(255,106,44,0.18)" : "none",
        }}
      >
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 origin-left transition-all duration-200"
          style={{
            top: floated ? 8 : rows ? 22 : 18,
            fontSize: floated ? 10 : 14,
            letterSpacing: floated ? "0.18em" : "0",
            textTransform: floated ? "uppercase" : "none",
            color: focused ? "#FFB23E" : "#9A9A9E",
          }}
        >
          {label}
        </label>
        {rows ? (
          <textarea
            id={id} rows={rows} value={value}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none bg-transparent text-sm text-forja-bone focus:outline-none"
          />
        ) : (
          <input
            id={id} type={type} value={value}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm text-forja-bone focus:outline-none"
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Magnetic wrapper ───────────────────────────────────────────────────────────

function Magnetic({ children, strength = 0.4, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
      duration: 0.4, ease: "power3.out",
    });
  };
  const onLeave = () => { if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" }); };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

export function ContactBentoMagnetic({ content }: { content: SiteContent }) {
  const tf = useTranslations("Contact");

  const cardRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Rotating word
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = wordRef.current;
      if (!el) return;
      gsap.to(el, { y: -14, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => {
        setWord((w) => (w + 1) % ROTATING.length);
        gsap.fromTo(el, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      }});
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Card 3D tilt
  const onCardMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: cx * 6, rotateX: -cy * 6, duration: 0.4, ease: "power2.out", transformPerspective: 1200 });
  };
  const onCardLeave = () => { if (cardRef.current) gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power2.out" }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!name.trim()) er.name = tf("errorRequired");
    if (!email.trim()) er.email = tf("errorRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) er.email = tf("errorEmail");
    if (!message.trim()) er.message = tf("errorRequired");
    setErrors(er);
    if (Object.keys(er).length) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden py-24">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #FF6A2C, transparent 70%)" }} />

      <div className="mx-auto max-w-6xl px-6" style={{ perspective: "1400px" }}>
        <div
          ref={cardRef}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
          className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl md:grid-cols-2"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Left — pitch + contact chips */}
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 p-10 md:border-b-0 md:border-r">
            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-forja-muted">Contact</p>
              <h2 className="font-display font-black uppercase leading-[0.95] text-forja-bone" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                Let&apos;s{" "}
                <span ref={wordRef} className="fire-text inline-block">{ROTATING[word]}</span>
                <br />something.
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-forja-muted">
                Drop us a line — we read every message and reply within a day.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Magnetic strength={0.25}>
                <a href={`mailto:${content.meta.contact.email}`}
                  className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-forja-bone transition-colors hover:border-forja-amber">
                  <span className="text-forja-amber">✉</span>{content.meta.contact.email}
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a href={`https://wa.me/${content.meta.contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-forja-bone transition-colors hover:border-forja-amber">
                  <span className="text-forja-amber">☏</span>{content.meta.contact.whatsapp}
                </a>
              </Magnetic>
              <ul className="flex flex-wrap gap-4 pt-1 text-xs text-forja-muted">
                {content.meta.socials.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-forja-bone">{s.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — floating-label form */}
          <div className="p-10">
            {submitted ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #FF6A2C, #FFB23E, transparent)" }} />
                <p className="font-display text-2xl font-black uppercase text-forja-bone">{tf("success")}</p>
                <p className="text-sm text-forja-muted">{content.meta.contact.email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <FloatField id="bm-name" label={tf("name")} value={name} onChange={setName} error={errors.name} />
                <FloatField id="bm-email" label={tf("email")} type="email" value={email} onChange={setEmail} error={errors.email} />
                <FloatField id="bm-message" label={tf("message")} rows={4} value={message} onChange={setMessage} error={errors.message} />
                <Magnetic strength={0.35} className="mt-2 self-start">
                  <button type="submit" disabled={sending}
                    className="fire-bg cursor-pointer rounded-full px-10 py-3.5 font-semibold text-forja-black transition-all hover:brightness-110 disabled:opacity-60">
                    {sending ? tf("sending") : tf("send")}
                  </button>
                </Magnetic>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
