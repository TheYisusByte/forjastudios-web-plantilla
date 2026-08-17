import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FORJA_LOGO } from "@/lib/brand";

/**
 * Pie de página del sitio. Vive aparte porque lo comparten la home y las
 * páginas internas (proyecto e IP), que llevan el mismo cierre: logo, enlace
 * al inicio y aviso de copyright.
 */
export async function FooterE() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Al inicio de la home: en la propia home sube al hero, y desde una
              interna vuelve a la portada. */}
          <Link href={{ pathname: "/", hash: "top" }}>
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
            © 2013–{new Date().getFullYear()} FORJA Studios. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
