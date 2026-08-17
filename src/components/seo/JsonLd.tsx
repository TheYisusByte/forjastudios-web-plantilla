/**
 * Inserta un bloque de datos estructurados (schema.org) en el HTML.
 *
 * El escapado de `<` no es decorativo: si un texto del CMS trae la secuencia
 * `</script>`, el navegador cerraría ahí la etiqueta y el resto del JSON se
 * volvería markup suelto en la página. Sustituirlo por su forma unicode deja
 * el JSON válido y el HTML intacto.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
