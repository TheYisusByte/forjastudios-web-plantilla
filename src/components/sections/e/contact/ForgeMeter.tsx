"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { SiteContent } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIRE = "linear-gradient(90deg, #FFB23E, #FF6A2C, #E03A2E)";

const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 67) % 100,
  size: 3 + (i % 3),
  rise: 200 + (i % 4) * 55,
  drift: i % 2 ? 14 : -14,
  dur: 4 + (i % 5),
  delay: i * 0.35,
}));
const SPARKS = Array.from({ length: 12 }, (_, i) => i);

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function Field({ id, label, type = "text", placeholder, rows, value, onChange, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const lit = focused || value.length > 0;
  const control =
    "w-full border-b border-border/60 bg-transparent pb-2 text-sm text-forja-bone placeholder:text-forja-muted/40 focus:outline-none";

  return (
    <div className="contact-field flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.25em] transition-colors duration-300"
        style={{ color: lit ? "#FFB23E" : undefined }}
      >
        {label}
      </label>
      <div className="relative">
        {rows ? (
          <textarea
            id={id} rows={rows} placeholder={placeholder} value={value}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className={`${control} resize-none`}
          />
        ) : (
          <input
            id={id} type={type} placeholder={placeholder} value={value}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className={control}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full"
          style={{
            background: FIRE,
            transformOrigin: "left",
            transform: `scaleX(${lit ? 1 : 0})`,
            boxShadow: lit ? "0 0 10px rgba(255,106,44,0.75)" : "none",
            transition: "transform 0.5s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.4s ease",
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ContactForgeMeter({ content }: { content: SiteContent }) {
  const tf = useTranslations("Contact");

  const sectionRef = useRef<HTMLElement>(null);
  const emberRef   = useRef<HTMLDivElement>(null);
  const sparkRef   = useRef<HTMLDivElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const filled =
    (name.trim().length > 1 ? 1 : 0) + (emailOk ? 1 : 0) + (message.trim().length > 3 ? 1 : 0);
  const progress = filled / 3;
  const heat =
    progress === 0 ? { label: "COLD",   color: "#9A9A9E" } :
    progress < 0.5 ? { label: "EMBER",  color: "#FFB23E" } :
    progress < 1   ? { label: "HOT",    color: "#FF6A2C" } :
                     { label: "MOLTEN", color: "#E03A2E" };

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const embers = emberRef.current?.querySelectorAll<HTMLElement>(".ember");
      embers?.forEach((el, i) => {
        const e = EMBERS[i];
        const tl = gsap.timeline({ repeat: -1, delay: e.delay });
        tl.fromTo(el, { y: 0, x: 0, opacity: 0, scale: 0.5 },
          { opacity: 0.9, scale: 1, duration: 0.6, ease: "power1.out" })
          .to(el, { y: -e.rise, x: e.drift, duration: e.dur, ease: "power1.out" }, 0)
          .to(el, { opacity: 0, duration: e.dur * 0.55, ease: "power1.in" }, e.dur * 0.45);
      });
    });
    return () => mm.revert();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".forge-reveal", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  const burst = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sparkRef.current?.querySelectorAll<HTMLElement>(".spark").forEach((el, i) => {
      const ang = (i / SPARKS.length) * Math.PI * 2;
      const dist = 55 + (i % 4) * 12;
      gsap.fromTo(el, { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, opacity: 0, scale: 0.3, duration: 0.7, ease: "power2.out" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!name.trim())    er.name    = tf("errorRequired");
    if (!email.trim())   er.email   = tf("errorRequired");
    else if (!emailOk)   er.email   = tf("errorEmail");
    if (!message.trim()) er.message = tf("errorRequired");
    setErrors(er);
    if (Object.keys(er).length) return;
    burst();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:gap-24">
        {/* Left — pitch + info */}
        <div className="flex flex-col justify-center">
          <p className="forge-reveal mb-6 text-xs uppercase tracking-[0.3em] text-forja-muted">Contact</p>
          <h2 className="forge-reveal font-display font-black uppercase leading-[0.9]" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)" }}>
            <span className="block text-forja-bone">Forge your</span>
            <span className="fire-text block">next project</span>
          </h2>
          <p className="forge-reveal mt-6 max-w-md text-pretty leading-relaxed text-forja-muted">
            Tell us what you want to build. Fill the form and watch the forge heat up.
          </p>
          <div className="forge-reveal mt-8 flex flex-col gap-3 text-sm">
            <a href={`mailto:${content.meta.contact.email}`} className="text-forja-muted transition-colors hover:text-forja-amber">
              {content.meta.contact.email}
            </a>
            <a href={`https://wa.me/${content.meta.contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="text-forja-muted transition-colors hover:text-forja-amber">
              {content.meta.contact.whatsapp}
            </a>
            <ul className="flex flex-wrap gap-4 pt-1 text-forja-muted">
              {content.meta.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-forja-bone">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — forge form */}
        <div className="forge-reveal relative w-full overflow-hidden rounded-2xl border border-border bg-forja-carbon/60 p-8 backdrop-blur-sm">
          <div ref={emberRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            {EMBERS.map((e, i) => (
              <span key={i} className="ember absolute bottom-2 rounded-full"
                style={{
                  left: `${e.left}%`, width: e.size, height: e.size, opacity: 0,
                  background: "radial-gradient(circle, #FFB23E 0%, #FF6A2C 70%, transparent 100%)",
                  filter: "blur(0.4px)",
                }} />
            ))}
          </div>

          <div className="relative z-10 flex h-full flex-col">
            {submitted ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #FF6A2C, #FFB23E, transparent)" }} />
                <p className="font-display text-2xl font-black uppercase text-forja-bone">{tf("success")}</p>
                <p className="text-sm text-forja-muted">{content.meta.contact.email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
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

                <Field id="fm-name" label={tf("name")} placeholder={tf("namePh")} value={name} onChange={setName} error={errors.name} />
                <Field id="fm-email" label={tf("email")} type="email" placeholder={tf("emailPh")} value={email} onChange={setEmail} error={errors.email} />
                <Field id="fm-message" label={tf("message")} placeholder={tf("messagePh")} rows={4} value={message} onChange={setMessage} error={errors.message} />

                <div className="relative mt-2">
                  <div ref={sparkRef} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-20">
                    {SPARKS.map((i) => (
                      <span key={i} className="spark absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ background: "#FFB23E", boxShadow: "0 0 6px #FF6A2C", opacity: 0 }} />
                    ))}
                  </div>
                  <button type="submit" disabled={sending}
                    className="fire-bg w-full cursor-pointer rounded-full py-3.5 font-semibold uppercase tracking-wide text-forja-black transition-all hover:brightness-110 disabled:opacity-60"
                    style={{ boxShadow: progress === 1 ? "0 0 0 1.5px rgba(255,178,62,0.6), 0 12px 36px rgba(224,58,46,0.35)" : "none" }}>
                    <span className="inline-flex items-center gap-2"><span aria-hidden="true">⚒</span>{sending ? tf("sending") : tf("send")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
