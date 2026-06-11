import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto max-w-7xl px-6 py-20 sm:py-28", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  sub,
  className,
}: {
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-12", className)}>
      <h2 className="font-display text-3xl font-bold sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 max-w-xl text-pretty text-fg-muted">{sub}</p>}
    </div>
  );
}
