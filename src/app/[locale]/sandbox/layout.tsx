import type { Metadata } from "next";

/**
 * El sandbox es el banco de pruebas de conceptos y componentes: nunca debe
 * salir en buscadores. robots.txt ya lo bloquea, pero eso solo frena el
 * rastreo — una URL enlazada desde fuera puede indexarse igual, sin
 * descripción. La cabecera `noindex` es la que lo impide de verdad.
 *
 * Este layout no pinta nada: existe solo para colgar la metadata de todo el
 * subárbol y no repetirla en cada demo.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function SandboxLayout({ children }: LayoutProps<"/[locale]/sandbox">) {
  return children;
}
