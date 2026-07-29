import type { Project } from "@/lib/content/types";
import { DetailGalleryE } from "./DetailGalleryE";

/**
 * Detalle de proyecto = galería genérica con los datos del proyecto.
 * La UI vive en DetailGalleryE (compartida con el detalle de IP).
 */
export function ProjectDetailGalleryE({ project }: { project: Project }) {
  return (
    <DetailGalleryE
      title={project.title}
      kicker={`${project.categoryLabel} · ${project.year}`}
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
