import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pattern, type PatternHue, type PatternKind, type PatternScale } from "@/components/pattern/Pattern";

/**
 * One horizontal band of the page.
 *
 * Every band on this site sits on a patterned ground — that is the design, and
 * it is why this replaces the editorial template's `Section`, which chose
 * between four flat grounds. A band takes a plate colour *and* a pattern, and
 * the pattern is drawn behind everything the band contains.
 *
 * The one rule the component enforces structurally: the pattern is a sibling
 * layer at `z-index: -1` inside an `isolation: isolate` host, so it can never
 * end up in front of content, and it can never become the resolved background
 * of a text node. Body text inside a band still has to sit on its own
 * `.plate` — the pattern is behind the band, not behind the paragraph.
 */

export type PlateHue =
  | "shir"
  | "shir-deep"
  | "zafaran"
  | "golab"
  | "anar"
  | "pesteh"
  | "lajvard"
  | "ink"
  | "none";

/** Literal class strings, not composed at runtime: a template literal is a
 *  class name no stylesheet scanner can see. */
const PLATES: Record<PlateHue, string> = {
  shir: "plate plate--shir",
  "shir-deep": "plate plate--shir-deep",
  zafaran: "plate plate--zafaran",
  golab: "plate plate--golab",
  anar: "plate plate--anar",
  pesteh: "plate plate--pesteh",
  lajvard: "plate plate--lajvard",
  ink: "plate plate--ink",
  none: "",
};

export interface BandPattern {
  /** Unique in the document — a `<pattern>` is referenced by fragment id. */
  id: string;
  kind: PatternKind;
  hue: PatternHue;
  scale?: PatternScale;
  opacity?: number;
}

interface BandProps {
  children: ReactNode;
  id?: string;
  /** The band's own ground. `none` inherits whatever is behind it. */
  plate?: PlateHue;
  pattern?: BandPattern;
  /** Vertical rhythm. Bands deliberately do not all breathe the same. */
  rhythm?: "default" | "tight" | "none";
  /** Set false when the band manages its own horizontal padding. */
  contained?: boolean;
  /** True when the band holds rotated content and needs room for it. */
  tilted?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const RHYTHM = {
  default: "py-[var(--band-y)]",
  tight: "py-[var(--band-y-tight)]",
  none: "",
} as const;

export function Band({
  children,
  id,
  plate = "shir",
  pattern,
  rhythm = "default",
  contained = true,
  tilted = false,
  className,
  ...rest
}: BandProps) {
  const inner = contained ? (
    <div className={cn("container", tilted && "band--tilted")}>{children}</div>
  ) : (
    children
  );

  return (
    <section
      id={id}
      /* `rounded-none` cancels the radius `.plate` carries: a plate is an
         object with corners, a full-bleed band is the page itself. */
      className={cn("pattern-host rounded-none", PLATES[plate], RHYTHM[rhythm], className)}
      {...rest}
    >
      {pattern ? (
        <Pattern
          id={pattern.id}
          kind={pattern.kind}
          hue={pattern.hue}
          scale={pattern.scale}
          opacity={pattern.opacity}
        />
      ) : null}
      {inner}
    </section>
  );
}
