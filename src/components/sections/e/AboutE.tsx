"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Contact form ──────────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function Field({ id, label, type = "text", placeholder, required, rows, value, onChange, error }: FieldProps) {
  return (
    <div className="contact-field flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs uppercase tracking-[0.25em] text-forja-muted">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none border-b border-border bg-transparent pb-2 text-sm text-forja-bone placeholder:text-forja-muted/40 focus:border-accent focus:outline-none transition-colors"
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-b border-border bg-transparent pb-2 text-sm text-forja-bone placeholder:text-forja-muted/40 focus:border-accent focus:outline-none transition-colors"
        />
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function AboutE() {
  const t  = useTranslations("ConceptE");
  const tf = useTranslations("Contact");

  const sectionRef = useRef<HTMLElement>(null);
  const gifWrap    = useRef<HTMLDivElement>(null);
  const formWrap   = useRef<HTMLDivElement>(null);

  const [showForm,   setShowForm]   = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [sending,    setSending]    = useState(false);

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  // ── Transition: GIF → form ──────────────────────────────────────────────
  useEffect(() => {
    if (!showForm) return;
    const gif  = gifWrap.current;
    const form = formWrap.current;
    if (!gif || !form) return;

    // 1. Fade out GIF
    gsap.to(gif, { opacity: 0, duration: 0.45, ease: "power2.out", onComplete: () => {
      gif.style.pointerEvents = "none";
    }});

    // 2. Fade + stagger form in
    form.style.pointerEvents = "auto";
    gsap.fromTo(form, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.3 });
    gsap.from(form.querySelectorAll(".contact-field, .contact-submit"), {
      opacity: 0, y: 22, duration: 0.5, stagger: 0.1, ease: "power3.out", delay: 0.4,
    });
  }, [showForm]);

  // ── Scroll reveal ───────────────────────────────────────────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".about-e-heading > *", {
          y: 50, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ".about-e-heading", start: "top 78%", once: true },
        });
        gsap.from(".about-e-body", {
          y: 30, opacity: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".about-e-body", start: "top 82%", once: true },
        });
        gsap.from(".about-e-right", {
          opacity: 0, x: 30, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ".about-e-right", start: "top 78%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // ── Form submit ─────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = tf("errorRequired");
    if (!email.trim())   e.email   = tf("errorRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = tf("errorEmail");
    if (!message.trim()) e.message = tf("errorRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate Resend
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden pt-12 pb-24">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

          {/* ── Left — text + CTA ──────────────────────────────────────── */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-forja-muted">
              {t("aboutTitle")}
            </p>
            <div className="about-e-heading mb-8">
              <h2
                className="font-display font-black uppercase leading-[0.88]"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
              >
                <span className="block text-forja-bone">{t("aboutHeading1")}</span>
                <span className="fire-text block">{t("aboutHeading2")}</span>
              </h2>
            </div>
            <p className="about-e-body max-w-md text-pretty leading-relaxed text-forja-muted">
              {t("aboutBody")}
            </p>

            {!showForm && (
              <div className="about-e-body mt-8">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="fire-bg inline-flex cursor-pointer items-center rounded-full px-8 py-3.5 font-semibold text-forja-black transition-opacity hover:opacity-90"
                >
                  {t("aboutCta")}
                </button>
              </div>
            )}
          </div>

          {/* ── Right — GIF / form ─────────────────────────────────────── */}
          <div className="about-e-right relative flex min-h-[420px] items-stretch lg:min-h-[520px]">

            {/* GIF — fills container, fades out when form appears */}
            <div
              ref={gifWrap}
              className="absolute inset-0 overflow-hidden rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/forja/gifs/f40ce8_7c1d8fbff70644009e58dc0e26f7f0ca~mv2.gif"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            {/* Contact form — hidden until CTA click */}
            <div
              ref={formWrap}
              className="relative w-full rounded-2xl border border-border bg-forja-carbon/60 p-8 backdrop-blur-sm"
              style={{ opacity: 0, pointerEvents: "none" }}
            >
              {submitted ? (
                /* ── Success state ── */
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div
                    className="h-px w-16"
                    style={{ background: "linear-gradient(90deg, transparent, #FF6A2C, #FFB23E, transparent)" }}
                  />
                  <p className="font-display text-2xl font-black uppercase text-forja-bone">
                    {tf("success")}
                  </p>
                  <p className="text-sm text-forja-muted">hola@forjastudios.com</p>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="flex h-full flex-col gap-7" noValidate>
                  <Field
                    id="cf-name" label={tf("name")} placeholder={tf("namePh")}
                    required value={name} onChange={setName} error={errors.name}
                  />
                  <Field
                    id="cf-email" label={tf("email")} type="email" placeholder={tf("emailPh")}
                    required value={email} onChange={setEmail} error={errors.email}
                  />
                  <Field
                    id="cf-message" label={tf("message")} placeholder={tf("messagePh")}
                    required rows={4} value={message} onChange={setMessage} error={errors.message}
                  />
                  <div className="contact-submit mt-auto">
                    <button
                      type="submit"
                      disabled={sending}
                      className="fire-bg w-full cursor-pointer rounded-full py-3.5 font-semibold text-forja-black transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {sending ? tf("sending") : tf("send")}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
