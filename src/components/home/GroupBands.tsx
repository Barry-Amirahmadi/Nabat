import Link from "next/link";
import type { CSSProperties } from "react";
import { GROUP_STYLE, groupAnchor, groupRuns } from "@/content/groups";
import { publishedProducts } from "@/content/products";
import { collection, groupsBand } from "@/content/sections";
import { toFa } from "@/lib/digits";
import { cn } from "@/lib/cn";
import { Band } from "@/components/layout/Band";
import { BandHeading } from "@/components/layout/BandHeading";
import { Pattern } from "@/components/pattern/Pattern";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home band 4 — the three groups.
 *
 * Three wide blocks, one per group, each on its own hue with its own geometry
 * behind it. This is where the group colours are actually stated: the tiles in
 * band 2 run through the palette so the box reads as many-coloured, and this
 * band is what tells you which colour means which third of it.
 *
 * Every plate and every pattern here comes from the group registry, keyed off
 * `tone` — so a group's block, its header on the collection page and its
 * items' geometry cannot disagree. Counts are rendered from the data, so a
 * block cannot claim a number it does not have.
 */

const PLATES = {
  zafaran: "plate--zafaran",
  golab: "plate--golab",
  lajvard: "plate--lajvard",
  anar: "plate--anar",
  pesteh: "plate--pesteh",
} as const;

/** One fixed angle per block. Small — these are wide blocks, and a wide plate
 *  at 3° reads as a mistake rather than as a sticker. */
const TILTS = ["var(--tilt-6)", "var(--tilt-3)", "var(--tilt-2)"] as const;

export function GroupBands() {
  const runs = groupRuns(publishedProducts);

  return (
    <Band
      plate="shir-deep"
      pattern={{ id: "groups", kind: "border", hue: "tala", scale: "sm", opacity: 0.45 }}
      tilted
      aria-labelledby="groups-heading"
    >
      <BandHeading
        id="groups-heading"
        eyebrow={groupsBand.eyebrow}
        heading={groupsBand.heading}
        lead={groupsBand.lead}
        className="mb-[var(--band-y-tight)]"
      />

      {/* One column, three rows, every cell explicit. A single-column grid
          cannot trip the auto-placement cursor, but writing it out is what
          keeps the rule uniform — a grid on this site with an implicit cell in
          it is a grid nobody checked. */}
      <ul className="grid grid-cols-1 gap-[var(--grid-gap)]">
        {runs.map((run, i) => {
          const style = GROUP_STYLE[run.group.key];
          const rows = ["row-start-1", "row-start-2", "row-start-3"] as const;

          return (
            <li key={run.group.key} className={cn("col-start-1", rows[i])}>
              <Reveal
                delay={i * 80}
                /* `pattern-host` here, not on the inner div: it supplies the
                   `isolation: isolate` that keeps a `z-index: -1` pattern inside
                   this block. Without it the layer escapes to the nearest
                   stacking context — the band — and paints *behind* this
                   block's own plate colour, which is simply invisible. */
                className={cn("group-block pattern-host tilt plate", PLATES[style.plate])}
                style={{ "--tilt": TILTS[i] } as CSSProperties}
              >
                <Pattern
                  id={`group-${run.group.key}`}
                  kind={style.pattern}
                  hue="tala"
                  scale="md"
                  opacity={0.4}
                />

                <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:gap-8">
                  <div className="flex flex-col gap-3">
                    <h3 id={groupAnchor(run.group.key)} className="t-group">
                      {run.group.name}
                    </h3>
                    {/* Body text on a plate, never on the pattern behind it. */}
                    <p className="plate-own t-body max-w-[32ch] p-3">
                      {run.group.line}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5">
                    <p className="t-meta">
                      {toFa(run.items.length)} {collection.countLabel}
                    </p>
                    <Link
                      href={`/products/#${groupAnchor(run.group.key)}`}
                      className="btn btn--primary"
                    >
                      {groupsBand.linkLabel}
                      <span className="sr-only"> — {run.group.name}</span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
