import type { Project } from "@/lib/content/types";
import { clientDisplayName } from "@/lib/utils";
import { DetailGalleryE } from "./DetailGalleryE";

/**
 * Detalle de proyecto = galería genérica con los datos del proyecto.
 * La UI vive en DetailGalleryE (compartida con el detalle de IP).
 */
export function ProjectDetailGalleryE({
  project,
  clientLabel,
}: {
  project: Project;
  /** Etiqueta ya traducida de la firma bajo la portada ("Cliente"). */
  clientLabel: string;
}) {
  return (
    <DetailGalleryE
      title={project.title}
      kicker={`${project.categoryLabel} · ${project.year}`}
      // Firma: el cliente del proyecto, con su logo (campo `clienteLogo` del
      // proyecto o, si está vacío, el del CPT «Cliente» que se llame igual).
      brand={
        project.client
          ? {
              label: clientLabel,
              name: clientDisplayName(project.client),
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
