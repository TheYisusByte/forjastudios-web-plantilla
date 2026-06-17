"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import type { SiteContent } from "@/lib/content/types";

const FIRE = "linear-gradient(90deg, #FFB23E, #FF6A2C, #E03A2E)";

type StepKey = "name" | "email" | "message";

export function ContactConversational({ content }: { content: SiteContent }) {
  const tf = useTranslations("Contact");

  const steps: { key: StepKey; q: string; ph: string; rows?: number }[] = [
    { key: "name",    q: tf("name"),    ph: tf("namePh") },
    { key: "email",   q: tf("email"),   ph: tf("emailPh") },
    { key: "message", q: tf("message"), ph: tf("messagePh"), rows: 3 },
  ];

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<StepKey, string>>({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const stepRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const current = steps[step];
  const total = steps.length;
  const progress = (step + (done ? 1 : 0)) / total;

  // animate each step in
  useEffect(() => {
    if (done) return;
    const el = stepRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { inputRef.current?.focus(); return; }
    gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out",
      onComplete: () => inputRef.current?.focus() });
  }, [step, done]);

  const validateStep = useCallback((): boolean => {
    const v = values[current.key].trim();
    if (!v) { setError(tf("errorRequired")); return false; }
    if (current.key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError(tf("errorEmail")); return false; }
    setError("");
    return true;
  }, [current.key, values, tf]);

  const next = useCallback(async () => {
    if (!validateStep()) return;
    const el = stepRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const advance = async () => {
      if (step < total - 1) { setStep((s) => s + 1); return; }
      setSending(true);
      await new Promise((r) => setTimeout(r, 1100));
      setSending(false);
      setDone(true);
    };

    if (el && !reduce) {
      gsap.to(el, { y: -28, opacity: 0, duration: 0.32, ease: "power2.in", onComplete: advance });
    } else {
      advance();
    }
  }, [validateStep, step, total]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (!current.rows || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      next();
    }
  };

  const setVal = (v: string) => setValues((prev) => ({ ...prev, [current.key]: v }));

  return (
    <section className="relative overflow-hidden py-24">
      {/* Top progress bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
        <div className="h-full" style={{ width: `${progress * 100}%`, background: FIRE, transition: "width 0.5s cubic-bezier(0.22,0.61,0.36,1)" }} />
      </div>

      <div className="mx-auto flex min-h-[420px] max-w-3xl flex-col justify-center px-6">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-6 h-px w-20" style={{ background: "linear-gradient(90deg, transparent, #FF6A2C, #FFB23E, transparent)" }} />
            <p className="font-display font-black uppercase text-forja-bone" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>{tf("success")}</p>
            <p className="mt-4 text-forja-muted">{content.meta.contact.email}</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-forja-muted">
              {String(step + 1).padStart(2, "0")} <span className="text-forja-muted/40">/ {String(total).padStart(2, "0")}</span>
            </p>

            <div ref={stepRef}>
              <label htmlFor="conv-input" className="mb-5 block font-display font-black uppercase leading-[0.95] text-forja-bone" style={{ fontSize: "clamp(1.9rem, 5vw, 3.4rem)" }}>
                {current.q}
              </label>

              {current.rows ? (
                <textarea
                  id="conv-input"
                  ref={(el) => { inputRef.current = el; }}
                  rows={current.rows}
                  placeholder={current.ph}
                  value={values[current.key]}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="w-full resize-none border-b-2 border-border bg-transparent pb-3 text-xl text-forja-bone placeholder:text-forja-muted/30 focus:border-forja-amber focus:outline-none transition-colors"
                />
              ) : (
                <input
                  id="conv-input"
                  ref={(el) => { inputRef.current = el; }}
                  type={current.key === "email" ? "email" : "text"}
                  placeholder={current.ph}
                  value={values[current.key]}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="w-full border-b-2 border-border bg-transparent pb-3 text-2xl text-forja-bone placeholder:text-forja-muted/30 focus:border-forja-amber focus:outline-none transition-colors"
                />
              )}

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

              <div className="mt-8 flex items-center gap-5">
                <button type="button" onClick={next} disabled={sending}
                  className="fire-bg inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-forja-black transition-all hover:brightness-110 disabled:opacity-60">
                  {sending ? tf("sending") : step < total - 1 ? "OK" : tf("send")}
                  <span aria-hidden="true">→</span>
                </button>
                <span className="text-xs text-forja-muted">
                  {current.rows ? "⌘/Ctrl + Enter" : "press Enter ↵"}
                </span>
              </div>
            </div>

            {/* Step dots */}
            <div className="mt-12 flex gap-2">
              {steps.map((s, i) => (
                <span key={s.key} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === step ? 26 : 8, background: i <= step ? "#FF6A2C" : "rgba(244,241,236,0.18)" }} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
