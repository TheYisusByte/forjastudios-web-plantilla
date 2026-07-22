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
      gallery={project.gallery}
      backHref="/#work"
    />
  );
}
