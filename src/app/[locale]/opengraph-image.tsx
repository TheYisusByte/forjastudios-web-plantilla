/**
 * Imagen de Open Graph de marca (1200×630).
 * ---------------------------------------------------------------------------
 * Es la tarjeta que sale al compartir el sitio en WhatsApp, LinkedIn, X o
 * Slack. Vive en el segmento `[locale]`, así que la heredan todas las rutas de
 * abajo (`/team`, y las internas que no traigan portada propia).
 *
 * Se genera en el build, una por idioma, y queda como archivo estático: no hay
 * render en caliente ni consumo de la cuota de imágenes de Vercel.
 *
 * El logo se lee del disco y se incrusta en base64 porque `ImageResponse` no
 * resuelve rutas relativas del sitio — durante el build todavía no hay
 * servidor que responda `/assets/...`.
 *
 * La tipografía va en .ttf y no en el .woff2 que usa el sitio: Satori (el
 * motor de `ImageResponse`) no descomprime woff2. Es el mismo Garet Heavy,
 * convertido con fonttools, y solo se lee en build — al navegador no llega.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Forja Studios — Forge your flame";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  const [logo, garetHeavy, garetBook] = await Promise.all([
    readFile(
      join(process.cwd(), "public/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png"),
    ),
    readFile(join(process.cwd(), "src/lib/fonts/garet-heavy.ttf")),
    readFile(join(process.cwd(), "src/lib/fonts/garet-book.ttf")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Resplandor de forja: el acento de marca sin tapar el texto. La capa
            cubre todo el lienzo y el degradado se centra dentro; con un div
            más pequeño, su borde se recorta y deja una línea recta visible. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 78% 12%, rgba(255,106,44,0.40) 0%, rgba(255,106,44,0.20) 16%, rgba(224,58,46,0.07) 30%, rgba(10,10,11,0) 46%)",
          }}
        />

        {/* `img` a pelo: ImageResponse rasteriza HTML plano, next/image no
            existe en este contexto. */}
        <img src={logoSrc} width={420} height={155} alt="" style={{ objectFit: "contain" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Garet",
              fontWeight: 700,
              fontSize: 76,
              color: "#f4f1ec",
              textTransform: "uppercase",
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            Forge your flame
          </div>
          <div
            style={{
              fontFamily: "Garet",
              fontWeight: 400,
              fontSize: 30,
              color: "#9a9a9e",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {t("ogDescription")}
          </div>
        </div>

        {/* Barra del gradiente firma, al pie. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 14,
            background: "linear-gradient(100deg, #ffb23e, #ff6a2c 55%, #e03a2e)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Garet", data: garetBook, weight: 400, style: "normal" },
        { name: "Garet", data: garetHeavy, weight: 700, style: "normal" },
      ],
    },
  );
}
