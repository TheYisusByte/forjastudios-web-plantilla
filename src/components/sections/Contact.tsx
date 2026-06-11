"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/content/types";

type Status = "idle" | "sending" | "sent";

export function Contact({ content }: { content: SiteContent }) {
  const t = useTranslations("Contact");
  const ts = useTranslations("Sections");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = t("errorRequired");
    if (!email) next.email = t("errorRequired");
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = t("errorEmail");
    if (!message) next.message = t("errorRequired");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    // TODO: wire to Resend / WP. Simulated success for the concept demo.
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  const field =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg outline-none transition-colors focus:border-accent";

  return (
    <Section id="contact">
      <SectionHeading title={ts("contact")} sub={ts("contactSub")} />
      <div className="grid gap-12 md:grid-cols-2">
        {status === "sent" ? (
          <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-surface p-6">
            <span className="fire-bg flex size-9 items-center justify-center rounded-full text-[#0a0a0b]">
              <Check className="size-5" />
            </span>
            <p className="text-fg">{t("success")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-fg-muted">
                {t("name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={t("namePh")}
                aria-invalid={!!errors.name}
                className={cn(field, errors.name && "border-forja-red")}
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-sm text-forja-red">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-fg-muted">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPh")}
                aria-invalid={!!errors.email}
                className={cn(field, errors.email && "border-forja-red")}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-sm text-forja-red">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm text-fg-muted">
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder={t("messagePh")}
                aria-invalid={!!errors.message}
                className={cn(field, "resize-none", errors.message && "border-forja-red")}
              />
              {errors.message && (
                <p role="alert" className="mt-1 text-sm text-forja-red">
                  {errors.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="fire-bg inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-3 font-semibold text-[#0a0a0b] transition-all hover:brightness-110 disabled:opacity-60"
            >
              {status === "sending" ? t("sending") : t("send")}
            </button>
          </form>
        )}

        <div className="flex flex-col justify-center gap-5">
          <a
            href={`mailto:${content.meta.contact.email}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <Mail className="size-5 text-accent" />
            <span>{content.meta.contact.email}</span>
          </a>
          <a
            href={`https://wa.me/${content.meta.contact.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <Phone className="size-5 text-accent" />
            <span>{content.meta.contact.whatsapp}</span>
          </a>
          <ul className="flex flex-wrap gap-4 pt-2 text-sm text-fg-muted">
            {content.meta.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-fg"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
