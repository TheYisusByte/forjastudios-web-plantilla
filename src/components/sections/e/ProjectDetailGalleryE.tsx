import type { Project } from "@/lib/content/types";
import { clientDisplayName } from "@/lib/utils";
import { DetailGalleryE } from "./DetailGalleryE";

/**
 * Detalle de proyecto = galería genérica con los datos del proyecto.
 * La UI vive en DetailGalleryE (compartida con el detalle de IP).
 */
export function ProjectDetailGalleryE({ project }: { project: Project }) {
  const client = clientDisplayName(project.client);

  return (
    <DetailGalleryE
      title={project.title}
      kicker={`${project.categoryLabel} · ${project.year}`}
      // Firma bajo la portada: el logo del cliente (campo `clienteLogo` del
      // proyecto o, si está vacío, el del CPT «Cliente» que se llame igual) y
      // la línea de crédito. «Client ©» va en inglés a propósito: es la
      // fórmula del crédito, no texto de interfaz, y no se traduce.
      brand={
        client
          ? {
              name: client,
              credit: `Client © ${client} - ${project.year}`,
              logoUrl: project.clientLogoUrl,
            }
          : undefined
      }
      description={project.description}
      coverUrl={project.coverUrl}
      // Video del proyecto (ACF `videoUrl`, normalmente un mp4 del propio WP):
      // manda como portada y deja la imagen de cover como poster.
      coverVideoUrl={project.videoUrl}
      gallery={project.gallery}
      backHref="/#work"
    />
  );
}
