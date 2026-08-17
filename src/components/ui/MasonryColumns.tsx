"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

/**
 * Masonry en columnas que se LEE EN HORIZONTAL.
 * ---------------------------------------------------------------------------
 * Con `columns` de CSS el navegador llena una columna entera antes de pasar a
 * la siguiente, así que los elementos consecutivos quedan uno DEBAJO de otro.
 * En una galería donde el orden lo decide el cliente (los pasos de una
 * ilustración, una secuencia de fotogramas) eso rompe la lectura: la serie
 * aparece repartida en vertical en vez de leerse de izquierda a derecha.
 *
 * Aquí las columnas se reparten a mano: el elemento `i` va a la columna
 * `i % columnas`. Los primeros N ocupan la primera fila, los siguientes N la
 * segunda, etc., y cada columna sigue creciendo por su cuenta —así se conserva
 * el masonry (alturas naturales, sin huecos ni recortes)—.
 *
 * Cuántas columnas hay depende del ancho, y eso solo se sabe en el cliente:
 * `useSyncExternalStore` lo resuelve sin desincronizar la hidratación (el HTML
 * del servidor sale con `defaultColumns` y se reajusta al hidratar).
 */

/** Umbral de ancho → número de columnas. Se declaran de mayor a menor `min`. */
export type MasonryBreakpoint = { min: number; cols: number };

export function MasonryColumns<T>({
  items,
  breakpoints,
  defaultColumns,
  gap = "0.5rem",
  className,
  children,
}: {
  items: T[];
  /** De mayor a menor `min`: manda el primero que cumpla. */
  breakpoints: MasonryBreakpoint[];
  /** Columnas cuando ningún umbral aplica; es también lo que se renderiza en el servidor. */
  defaultColumns: number;
  /** Separación entre columnas y entre celdas. */
  gap?: string;
  className?: string;
  /** Cómo se pinta cada elemento. El índice es el del array original. */
  children: (item: T, index: number) => ReactNode;
}) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mqs = breakpoints.map((b) => window.matchMedia(`(min-width: ${b.min}px)`));
      mqs.forEach((mq) => mq.addEventListener("change", onChange));
      return () => mqs.forEach((mq) => mq.removeEventListener("change", onChange));
    },
    [breakpoints],
  );

  const snapshot = useCallback(() => {
    for (const b of breakpoints) {
      if (window.matchMedia(`(min-width: ${b.min}px)`).matches) return b.cols;
    }
    return defaultColumns;
  }, [breakpoints, defaultColumns]);

  const columnCount = useSyncExternalStore(subscribe, snapshot, () => defaultColumns);

  // Reparto por filas: el índice original viaja con el elemento para que quien
  // lo pinte pueda seguir usándolo (abrir el lightbox, escalonar la entrada…).
  const columns: { item: T; index: number }[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => columns[index % columnCount].push({ item, index }));

  return (
    <div className={className} style={{ display: "flex", gap }}>
      {columns.map((column, i) => (
        <div
          key={i}
          style={{ display: "flex", flexDirection: "column", gap, flex: "1 1 0", minWidth: 0 }}
        >
          {column.map(({ item, index }) => (
            <div key={index}>{children(item, index)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
