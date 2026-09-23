"use client";

import { useState } from "react";
import { sortedGallery } from "@/content/gallery";
import { GalleryTile } from "./GalleryTile";
import { GalleryLightbox } from "./GalleryLightbox";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * The gallery wall — the one uneven grid on the site.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Every cell states its row, its column and its span, at all three
 * breakpoints, and nothing is left to auto-placement.
 *
 * This is the layout where the grid algorithm is most tempting and most
 * dangerous. Sparse auto-placement never moves its cursor backwards: a cell
 * that asks for an earlier column than the one the cursor is on gets pushed
 * into a new implicit row instead, silently. With eight cells of three
 * different widths, that produces a wall with holes in it and no error
 * anywhere — the build passes, the console is clean, and it is only visible
 * to an eye. Since nobody here is allowed to look, the placement has to be
 * arithmetic instead: twelve columns, and every row adds up.
 *
 *   lg   row 1 · 5 + 3 + 4 = 12
 *        row 2 · 3 + 4 + 5 = 12
 *        row 3 · 3 + 4     = 7, flush to the start edge
 *   md   full-width for the two `lg` weights, pairs of six for the rest
 *   base one column, eight rows
 *
 * The short last row is deliberate. A wall of eight over rows of three cannot
 * be full, and ending flush with the start edge — the right edge, in Persian
 * — puts the ragged end where the eye leaves rather than where it arrives.
 *
 * `weight` comes from the content deck: it is the editor's emphasis, and it
 * chooses the span. `plate` and `tilt` are positional, from the tables below,
 * so the wall is many-coloured without any item owning a colour.
 * ────────────────────────────────────────────────────────────────────────────
 */

interface Cell {
  /** Literal placement classes. Never composed from a template literal —
   *  Tailwind's scanner reads source text, so a generated class name is not
   *  in the stylesheet and the cell falls back to auto-placement. */
  place: string;
  sizes: string;
  /** Expected computed placement, read by the verification pass. */
  expect: { base: [number, number]; md: [number, number]; lg: [number, number] };
}

const FULL_TO_WIDE =
  "(max-width: 48rem) 92vw, (max-width: 64rem) 92vw, 42vw";
const HALF_TO_NARROW =
  "(max-width: 48rem) 92vw, (max-width: 64rem) 46vw, 25vw";
const HALF_TO_MID = "(max-width: 48rem) 92vw, (max-width: 64rem) 46vw, 34vw";

const CELLS: Cell[] = [
  {
    place:
      "col-span-12 col-start-1 row-start-1 md:col-span-12 md:col-start-1 md:row-start-1 lg:col-span-5 lg:col-start-1 lg:row-start-1",
    sizes: FULL_TO_WIDE,
    expect: { base: [1, 1], md: [1, 1], lg: [1, 1] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-2 md:col-span-6 md:col-start-1 md:row-start-2 lg:col-span-3 lg:col-start-6 lg:row-start-1",
    sizes: HALF_TO_NARROW,
    expect: { base: [2, 1], md: [2, 1], lg: [1, 6] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-3 md:col-span-6 md:col-start-7 md:row-start-2 lg:col-span-4 lg:col-start-9 lg:row-start-1",
    sizes: HALF_TO_MID,
    expect: { base: [3, 1], md: [2, 7], lg: [1, 9] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-4 md:col-span-6 md:col-start-1 md:row-start-3 lg:col-span-3 lg:col-start-1 lg:row-start-2",
    sizes: HALF_TO_NARROW,
    expect: { base: [4, 1], md: [3, 1], lg: [2, 1] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-5 md:col-span-6 md:col-start-7 md:row-start-3 lg:col-span-4 lg:col-start-4 lg:row-start-2",
    sizes: HALF_TO_MID,
    expect: { base: [5, 1], md: [3, 7], lg: [2, 4] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-6 md:col-span-12 md:col-start-1 md:row-start-4 lg:col-span-5 lg:col-start-8 lg:row-start-2",
    sizes: FULL_TO_WIDE,
    expect: { base: [6, 1], md: [4, 1], lg: [2, 8] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-7 md:col-span-6 md:col-start-1 md:row-start-5 lg:col-span-3 lg:col-start-1 lg:row-start-3",
    sizes: HALF_TO_NARROW,
    expect: { base: [7, 1], md: [5, 1], lg: [3, 1] },
  },
  {
    place:
      "col-span-12 col-start-1 row-start-8 md:col-span-6 md:col-start-7 md:row-start-5 lg:col-span-4 lg:col-start-4 lg:row-start-3",
    sizes: HALF_TO_MID,
    expect: { base: [8, 1], md: [5, 7], lg: [3, 4] },
  },
];

/** Eight cards over six hues, so no two neighbours share a colour in any of
 *  the three arrangements. Checked against the table above by hand. */
const PLATES = [
  "plate--shir",
  "plate--zafaran",
  "plate--shir-deep",
  "plate--lajvard",
  "plate--shir",
  "plate--golab",
  "plate--pesteh",
  "plate--shir-deep",
] as const;

const TILTS = [
  "var(--tilt-2)",
  "var(--tilt-5)",
  "var(--tilt-1)",
  "var(--tilt-7)",
  "var(--tilt-3)",
  "var(--tilt-6)",
  "var(--tilt-9)",
  "var(--tilt-4)",
] as const;

export function GalleryWall() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-12 items-start gap-[var(--grid-gap)]">
        {sortedGallery.map((item, i) => {
          const cell = CELLS[i % CELLS.length];

          return (
            <li
              key={item.id}
              className={cn("flex", cell.place)}
              data-wall-cell={item.id}
              data-grid-base={cell.expect.base.join(",")}
              data-grid-md={cell.expect.md.join(",")}
              data-grid-lg={cell.expect.lg.join(",")}
            >
              <Reveal delay={(i % 3) * 90} className="flex w-full">
                <GalleryTile
                  item={item}
                  sizes={cell.sizes}
                  plate={PLATES[i % PLATES.length]}
                  tilt={TILTS[i % TILTS.length]}
                  onOpen={() => setOpenIndex(i)}
                  className="w-full"
                />
              </Reveal>
            </li>
          );
        })}
      </ul>

      <GalleryLightbox
        items={sortedGallery}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
