import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Nombre del cliente listo para mostrar.
 *
 * En WordPress el campo `cliente` se ha ido rellenando como una línea de
 * créditos ("Client © TIMBA Studios", "Client ©katapix"), y ese prefijo no
 * pinta nada bajo la portada. Se le quita cuando está, y en cualquier otro caso
 * el texto se respeta tal cual: hay créditos con matices que sí importan
 * ("Fan Art by FORJA Studios © Super Cell").
 */
export function clientDisplayName(raw: string): string {
  const cleaned = raw.replace(/^\s*clients?\s*[:©-]*\s*/i, "").trim();
  return cleaned || raw.trim();
}
