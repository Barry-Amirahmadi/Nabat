import type { CSSProperties } from "react";
import type { GroupRun as Run } from "@/content/groups";
import { GROUP_STYLE, groupAnchor } from "@/content/groups";
import { collection } from "@/content/sections";
import { toFa } from "@/lib/digits";
import { cn } from "@/lib/cn";
import { Band } from "@/components/layout/Band";
import { BoxGrid } from "./BoxGrid";
import { Reveal } from "@/components/motion/Reveal";

/**
 * One group on the collection page: its header, then its three tiles.
 *
 * The header is large type on a coloured plate — the group's own colour, from
 * the registry, so it agrees with the block on the homepage and with the
 * geometry behind its items' tiles. The band's pattern is the group's too, so
 * each third of the page has a different ground and you can tell which group
 * you have scrolled into without reading the heading.
 *
 * `offset` is the position of this group's first item in the whole collection,
 * which is what keeps an item's angle and hue the same here as on the
 * homepage. See the note in `BoxGrid` on why placement and decoration are two
 * separate tables.
 */

const PLATES = {
  zafaran: "plate--zafaran",
  golab: "plate--golab",
  lajvard: "plate--lajvard",
  anar: "plate--anar",
  pesteh: "plate--pesteh",
} as const;

const HEADER_TILTS = ["var(--tilt-3)", "var(--tilt-6)", "var(--tilt-2)"] as const;

export function GroupRun({
  run,
  index,
  offset,
}: {
  run: Run;
  index: number;
  offset: number;
}) {
  const style = GROUP_STYLE[run.group.key];
  const headingId = groupAnchor(run.group.key);

  return (
    <Band
      plate={index % 2 === 0 ? "shir" : "shir-deep"}
      pattern={{
        id: `run-${run.group.key}`,
        kind: style.pattern,
        hue: "tala",
        scale: "md",
        opacity: 0.35,
      }}
      rhythm="tight"
      tilted
      aria-labelledby={headingId}
    >
      <div className="mb-[var(--band-y-tight)] flex flex-col items-start gap-4">
        <Reveal
          className={cn("badge tilt plate", PLATES[style.plate])}
          style={{ "--tilt": HEADER_TILTS[index % HEADER_TILTS.length] } as CSSProperties}
        >
          <h2 id={headingId} className="t-group">
            {run.group.name}
          </h2>
        </Reveal>

        <Reveal delay={80} className="plate-own max-w-[var(--measure)] p-4">
          <p className="t-lead">{run.group.line}</p>
        </Reveal>

        <Reveal delay={140}>
          <p className="t-meta on-band inline-block py-1">
            {toFa(run.items.length)} {collection.countLabel}
          </p>
        </Reveal>
      </div>

      <BoxGrid products={run.items} listLabel={run.group.name} offset={offset} />
    </Band>
  );
}
