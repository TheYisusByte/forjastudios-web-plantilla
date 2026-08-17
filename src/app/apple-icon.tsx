/**
 * Icono para "Añadir a pantalla de inicio" en iOS (180×180).
 *
 * Sin él, iOS guarda una captura de la página como icono. Se genera a partir
 * del mismo isotipo que el favicon, aplanado sobre el negro de marca: el PNG
 * original tiene fondo transparente y iOS lo compondría sobre blanco.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const icon = await readFile(join(process.cwd(), "src/app/icon.png"));
  const src = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
        }}
      >
        {/* `img` a pelo: ImageResponse rasteriza HTML plano, next/image no
            existe en este contexto. */}
        <img src={src} width={148} height={147} alt="" />
      </div>
    ),
    size,
  );
}
