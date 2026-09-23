import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * The pattern system — where this site's density actually comes from.
 *
 * Four tileable geometries, six hues, three scales: seventy-two combinations,
 * drawn entirely in SVG. That is the whole reason this site needs eight image
 * files rather than fifty. A maximalist page built from photographs would need
 * a photograph per surface; a maximalist page built from geometry needs four
 * `<pattern>` definitions and a colour token.
 *
 * Three rules hold the system together:
 *
 * 1. **`id` is required and must be unique in the document.** A `<pattern>` is
 *    a paint server referenced by fragment id. Two instances sharing an id do
 *    not error — the second silently paints with the first one's geometry,
 *    which is exactly the class of bug that looks like a design choice. The
 *    call site names each one after the band it is in.
 *
 * 2. **Colour comes from a token, never a literal.** The stroke is applied as
 *    a CSS custom property through `style`, not as an SVG `stroke` attribute:
 *    `stroke="var(--color-tala)"` as an XML attribute does not resolve, while
 *    the CSS property does. So tokens.css stays the only place a colour is
 *    spelled, and the verification pass can read the computed stroke back out
 *    of the DOM rather than being told what it should be.
 *
 * 3. **Decorative, and structurally so.** `aria-hidden` on the host, nothing
 *    focusable inside, no meaning that is not also carried in text.
 *
 * Pattern never sits directly behind body text. Body text sits on a solid
 * plate, and the plate sits on the pattern. Display type over pattern is fine
 * and is measured: where a band reverses type out of a pattern rather than off
 * a plate, the stroke colour is chosen so the type clears its ratio against
 * the strokes *and* the ground — gold on cream is 2.29:1, which is why the
 * gold strokes only ever appear behind plates, and the one band that knocks
 * type straight out of a pattern uses a lighter lapis at 5.24:1 instead.
 */

export type PatternKind = "tile" | "border" | "dots" | "arch";

/** Stroke colours. `tala` is the pattern-native one; it is never used as text. */
export type PatternHue = "tala" | "zafaran" | "anar" | "pesteh" | "golab" | "lajvard" | "ink" | "shir" | "lapis-light";

export type PatternScale = "sm" | "md" | "lg";

/** Cell size in CSS pixels per scale step. The geometry is authored in a
 *  100-unit viewBox and mapped onto this, so one number changes the density. */
const CELL: Record<PatternScale, number> = { sm: 44, md: 76, lg: 128 };

/** Eight-pointed star, as the 16 alternating vertices of a `<polygon>`. */
function star(cx: number, cy: number, outer: number, inner: number, points = 8): string {
  const vertices: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    vertices.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return vertices.join(" ");
}

/**
 * The four geometries, each authored in a 100×100 cell.
 *
 * Anything drawn past the cell edge is clipped by the pattern tile and
 * completed by the neighbouring repeat — which is how the corner crosses in
 * `tile` and the arch feet in `arch` join up across the tiling.
 */
const GEOMETRY: Record<PatternKind, { aspect: number; body: React.ReactNode }> = {
  /* تیله — the eight-pointed star and cross. The oldest tiling geometry in
     the region, and the one a confectioner's box lid is printed with. */
  tile: {
    aspect: 1,
    body: (
      <>
        <polygon points={star(50, 50, 30, 12.5)} />
        <polygon points={star(50, 50, 14, 6)} />
        <path d="M-9 0H9M0-9V9M91 0h18M100-9V9M-9 100H9M0 91v18M91 100h18M100 91v18" />
      </>
    ),
  },

  /* A repeating carpet border, for a band edge: two rules, a serrated run
     between them, and a diamond at each repeat. */
  border: {
    aspect: 1,
    body: (
      <>
        <path d="M0 12h100M0 88h100" />
        <path d="M0 70 25 30 50 70 75 30 100 70" />
        <polygon points="50,42 58,50 50,58 42,50" />
        <polygon points="0,42 8,50 0,58 -8,50" />
        <polygon points="100,42 108,50 100,58 92,50" />
      </>
    ),
  },

  /* Sugar. Offset rows of filled circles — the only geometry in the set that
     is filled rather than stroked, which is what makes it read as grain
     beside the three linear patterns. */
  dots: {
    aspect: 1,
    body: (
      <>
        <circle cx="25" cy="25" r="9" strokeWidth="0" style={{ fill: "currentColor" }} />
        <circle cx="75" cy="75" r="9" strokeWidth="0" style={{ fill: "currentColor" }} />
        <circle cx="75" cy="25" r="3.5" strokeWidth="0" style={{ fill: "currentColor" }} />
        <circle cx="25" cy="75" r="3.5" strokeWidth="0" style={{ fill: "currentColor" }} />
      </>
    ),
  },

  /* Repeating pointed arches. Taller than wide, so the cell is 3:4. */
  arch: {
    aspect: 0.75,
    body: (
      <>
        <path d="M10 100V52C10 26 27 8 50 2 73 8 90 26 90 52v48" />
        <path d="M28 100V56C28 38 37 26 50 21 63 26 72 38 72 56v44" />
        <path d="M0 100h100" />
      </>
    ),
  },
};

interface PatternProps {
  /** Unique within the document — see rule 1 above. */
  id: string;
  kind: PatternKind;
  /** Token name of the stroke colour. */
  hue: PatternHue;
  scale?: PatternScale;
  /** For a pattern sitting behind plates, where full strength would shout
   *  over the content in front of it. Never lowered on a pattern that carries
   *  type, because a faded stroke is a stroke whose ratio was not measured. */
  opacity?: number;
  className?: string;
}

export function Pattern({ id, kind, hue, scale = "md", opacity = 1, className }: PatternProps) {
  const { aspect, body } = GEOMETRY[kind];
  const width = CELL[scale];
  const height = Math.round(width / aspect);
  const patternId = `pat-${id}`;

  return (
    <div
      className={cn("pattern-layer", className)}
      aria-hidden="true"
      /* Marks the layer for the verification pass, which reads the computed
         stroke colour off the geometry rather than being handed a literal. */
      data-pattern-layer={kind}
      style={{ opacity } as CSSProperties}
    >
      <svg aria-hidden="true" focusable="false" preserveAspectRatio="none">
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={width}
            height={height}
            viewBox={`0 0 100 ${(100 / aspect).toFixed(0)}`}
          >
            <g
              data-pattern-ink=""
              fill="none"
              strokeWidth={5}
              strokeLinecap="square"
              style={{ stroke: `var(--color-${hue})`, color: `var(--color-${hue})` }}
            >
              {body}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
