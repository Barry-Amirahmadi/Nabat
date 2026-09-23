import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The micro-label above a band heading.
 *
 * A filled chip rather than the editorial family's hairline-and-word: on a
 * patterned ground a bare word with a rule next to it disappears, and the
 * chip is also a small solid plate, which is the shape this whole design is
 * built out of.
 *
 * It paints itself in the two measured colours of whatever plate it sits on —
 * the plate's ink becomes the fill and the plate's own background becomes the
 * label — so it is legible on all seven plates without a single scoped
 * override. Same mechanism as `.btn--primary`; see the note in components.css.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("chip", className)}
      style={{
        backgroundColor: "var(--on-plate, var(--color-ink))",
        color: "var(--plate-bg, var(--color-shir))",
      }}
    >
      {children}
    </span>
  );
}
