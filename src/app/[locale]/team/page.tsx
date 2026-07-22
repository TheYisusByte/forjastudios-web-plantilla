import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getSiteContent } from "@/lib/wp/client";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
// import { CursorE } from "@/components/sections/e/CursorE";
import { TeamE } from "@/components/sections/e/TeamE";

const FORJA_LOGO = "/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoETeamPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);
  const t = await getTranslations("TeamPage");
  const tf = await getTranslations("Footer");

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
            {t("headingTop")}
          </span>
          <span
            className="flame-text block"
            style={{ fontSize: "clamp(7rem, 18vw, 14rem)", letterSpacing: "-0.03em" }}
          >
            {t("headingMain")}
          </span>
        </h1>

        <div className="mt-8 flex items-start gap-4">
          <Image
            src={FORJA_LOGO}
            alt="Forja Studios"
            width={420}
            height={155}
            style={{ height: "2.5rem", width: "auto" }}
            className="shrink-0 object-contain"
          />
          <div className="h-8 w-px self-center bg-border/60" />
          <p className="max-w-md text-sm leading-relaxed text-forja-muted">
            {t("intro")}
          </p>
        </div>
      </div>

      <TeamE team={content.team} />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/">
              <Image
                src={FORJA_LOGO}
                alt="Forja Studios"
                height={40}
                width={160}
                style={{ height: "1.75rem", width: "auto" }}
                className="object-contain"
              />
            </Link>
            <p className="text-xs text-forja-muted">
              © 2013–{new Date().getFullYear()} FORJA Studios. {tf("rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
