"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { forjaAssets } from "@/lib/content/assets";
import type { SiteContent } from "@/lib/content/types";

const FIRE = "linear-gradient(90deg, #FFB23E, #FF6A2C, #E03A2E)";
const ROTATING = ["forge", "animate", "build", "imagine"];

// ── Floating-label field (de la opción C) ──────────────────────────────────────

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

// ── Magnetic wrapper (de la opción C — translate 2D, no es el tilt 3D) ──────────

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

export function ContactForgeBento({ content }: { content: SiteContent }) {
  const tf = useTranslations("Contact");

  const wordRef = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Heat meter (de la opción A)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const filled =
    (name.trim().length > 1 ? 1 : 0) + (emailOk ? 1 : 0) + (message.trim().length > 3 ? 1 : 0);
  const progress = filled / 3;
  const heat =
    progress === 0 ? { label: "COLD",   color: "#9A9A9E" } :
    progress < 0.5 ? { label: "EMBER",  color: "#FFB23E" } :
    progress < 1   ? { label: "HOT",    color: "#FF6A2C" } :
                     { label: "MOLTEN", color: "#E03A2E" };

  // Título animado (de la opción C) — palabra rotativa
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

  // (Sin tilt 3D — se omite a propósito en esta variante)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!name.trim()) er.name = tf("errorRequired");
    if (!email.trim()) er.email = tf("errorRequired");
    else if (!emailOk) er.email = tf("errorEmail");
    if (!message.trim()) er.message = tf("errorRequired");
    setErrors(er);
    if (Object.keys(er).length) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #FF6A2C, transparent 70%)" }} />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl md:grid-cols-2">
          {/* Left — título animado + contact chips */}
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
              <div className="mt-6 h-20 w-20 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 sm:h-24 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/forja/gifs/f40ce8_7c1d8fbff70644009e58dc0e26f7f0ca~mv2.gif"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
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
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {content.meta.socials.map((s) => {
                  const icon = forjaAssets.socialIcons[s.label];
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="opacity-70 transition-opacity hover:opacity-100"
                    >
                      {icon ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={icon} alt={s.label} className="h-5 w-5 object-contain" />
                      ) : (
                        <span className="text-xs text-forja-muted">{s.label}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — heat meter + floating-label form */}
          <div className="p-10">
            {submitted ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #FF6A2C, #FFB23E, transparent)" }} />
                <p className="font-display text-2xl font-black uppercase text-forja-bone">{tf("success")}</p>
                <p className="text-sm text-forja-muted">{content.meta.contact.email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {/* Heat meter (de la opción A) */}
                <div className="mb-1 flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-forja-muted">Forge your flame</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300" style={{ color: heat.color }}>{heat.label}</span>
                    <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${progress * 100}%`, background: FIRE,
                          boxShadow: progress > 0 ? "0 0 10px rgba(255,106,44,0.7)" : "none",
                          transition: "width 0.6s cubic-bezier(0.22,0.61,0.36,1)",
                        }} />
                    </div>
                  </div>
                </div>

                <FloatField id="fb-name" label={tf("name")} value={name} onChange={setName} error={errors.name} />
                <FloatField id="fb-email" label={tf("email")} type="email" value={email} onChange={setEmail} error={errors.email} />
                <FloatField id="fb-message" label={tf("message")} rows={4} value={message} onChange={setMessage} error={errors.message} />
                <Magnetic strength={0.35} className="mt-2 self-start">
                  <button type="submit" disabled={sending}
                    className="fire-bg cursor-pointer rounded-full px-10 py-3.5 font-semibold text-forja-black transition-all hover:brightness-110 disabled:opacity-60"
                    style={{ boxShadow: progress === 1 ? "0 0 0 1.5px rgba(255,178,62,0.6), 0 12px 36px rgba(224,58,46,0.35)" : "none" }}>
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
