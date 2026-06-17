import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
// import { CursorE } from "@/components/sections/e/CursorE";
import { TeamE } from "@/components/sections/e/TeamE";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoETeamPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      {/* <CursorE /> */}
      <NavE />

      {/* Page header */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-44">
        <h1 className="font-display font-black leading-[0.88] tracking-tight">
          <span
            className="block text-forja-bone"
            style={{ fontSize: "clamp(3.2rem, 7vw, 6rem)", letterSpacing: "-0.02em" }}
          >
            our
          </span>
          <span
            className="block text-forja-bone"
            style={{ fontSize: "clamp(7rem, 18vw, 14rem)", letterSpacing: "-0.03em" }}
          >
            TEAM
          </span>
        </h1>

        <div className="mt-8 flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-forja-bone">
              Forja<sup className="text-[0.65em]">®</sup>
            </p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-forja-muted">
              Studios
            </p>
          </div>
          <div className="h-8 w-px self-center bg-border/60" />
          <p className="max-w-md text-sm leading-relaxed text-forja-muted">
            We have a multidisciplinary team of over 70 artists, animators, designers,
            developers, 3D specialists, SFX experts, directors, and producers with more
            than 15 years of experience creating content for video games, animated series,
            advertising, Web3, audiovisual marketing, and digital products.
          </p>
        </div>
      </div>

      <TeamE team={content.team} />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <a href="/concepto-e">
              <Image
                src="/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png"
                alt="Forja Studios"
                height={40}
                width={160}
                style={{ height: "1.75rem", width: "auto" }}
                className="object-contain"
              />
            </a>
            <p className="text-xs text-forja-muted">
              © {new Date().getFullYear()} Forja Studios. All rights reserved.
            </p>
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-forja-muted/50">
            All the content displayed in this website and related to Forja Studios have all rights
            reserved © 2025. All audio, artwork and animations was developed by FORJA Studios
            and/or their team and have been authorized by them to be published in this website.
            If any content published infringes any copyright laws please contact us via email or
            contact section above.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
