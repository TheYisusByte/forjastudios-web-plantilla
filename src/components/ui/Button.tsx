import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "fire-bg text-[#0a0a0b] font-semibold hover:brightness-110",
  outline:
    "border border-border text-fg hover:border-accent hover:text-accent",
  ghost: "text-fg-muted hover:text-fg",
} as const;

interface ButtonProps extends ComponentProps<"a"> {
  variant?: keyof typeof variants;
}

/** Anchor-styled CTA (links to sections or external URLs). */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
