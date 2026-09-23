import type { ResolvedProduct } from "@/types/content";
import { cn } from "@/lib/cn";
import { ProductTile } from "./ProductTile";
import type { PlateHue } from "@/components/layout/Band";

/**
 * The box: tiles on a three-column grid, every one rotated, some of them
 * breaking the grid to overlap a neighbour.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY EVERY CELL DECLARES BOTH A ROW AND A COLUMN, AT EVERY BREAKPOINT
 *
 * CSS Grid's sparse auto-placement cursor never moves backwards. A cell that
 * asks for a column earlier than one already placed is not put where it asked
 * — it is silently pushed into a new implicit row, and the layout comes out
 * one row taller than it should with a hole in it. The editorial template this
 * engine came from documents the same trap: it had to pin `row-start-1` onto
 * the copy half of every product row for exactly this reason.
 *
 * A rotated, offset, overlapping grid is precisely where that recurs, because
 * negative margins and rotation make an extra implicit row look like a design
 * decision rather than a bug. So nothing here is left to auto-placement:
 * every tile names its row *and* its column at all three breakpoints, and the
 * verification pass reads the computed `grid-row-start` and
 * `grid-column-start` back out of the browser and compares them with the
 * `data-grid-*` attributes below.
 *
 * WHY DECORATION AND PLACEMENT ARE TWO SEPARATE TABLES
 *
 * This is the same trap one level up, and it is the reason the component is
 * shaped this way rather than having one table of nine.
 *
 * A tile's angle and colour belong to the *item*: قطاب must sit at the same
 * angle in the same hue on the homepage and on the collection page, or the two
 * surfaces stop looking like the same box. A tile's row and column belong to
 * the *grid it is in*: the homepage renders all nine at once, while the
 * collection page renders three grids of three. Handing a run of three the
 * placements of tiles 4–6 would have them ask for `lg:row-start-2` inside a
 * grid whose only row is row 1 — an empty first row, which is the auto-
 * placement bug arriving by the other door. `DECOR` is indexed by the item's
 * position in the whole collection; `PLACE_9` and `PLACE_3` are indexed by
 * position within this grid.
 *
 * WHY THE ANGLES AND COLOURS ARE CONSTANTS
 *
 * They are written out, one per tile, rather than generated. A random layout
 * cannot be reviewed, cannot be reproduced between two builds, and cannot be
 * regression-tested — the overflow check measures each rotated element's
 * bounding box against the viewport, which means nothing if the angle differs
 * next run. The class strings are literals for a second reason: a class name
 * assembled from a template literal is one no stylesheet scanner can see, so
 * `lg:col-start-${n}` would compile to nothing at all.
 *
 * WHY THE OVERLAPS ARE LG-ONLY, AND NEVER IN COLUMN 1
 *
 * An overlap is a negative inline margin, which makes the tile wider than its
 * column. At 390px the grid is one column wide and that extra width has
 * nowhere to go but off the side of the page. Every overlapping tile also sits
 * in column 2 or 3 — never column 1, which in an RTL document is the one
 * against the start edge, where a negative inline margin would push out of the
 * container instead of into a neighbour.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface Decor {
  plate: PlateHue;
  /** A `var(--tilt-n)` token name. Never a computed or random angle. */
  tilt: string;
}

/**
 * Angle and hue per item, by position in the collection.
 *
 * Nine tiles across five hues plus the deep cream, arranged so no two
 * neighbours share a colour at any of the three breakpoints — checked by hand
 * for the 1-, 2- and 3-column arrangements, which is why the order looks
 * arbitrary and is not.
 */
const DECOR: Decor[] = [
  { plate: "zafaran", tilt: "var(--tilt-1)" },
  { plate: "lajvard", tilt: "var(--tilt-2)" },
  { plate: "golab", tilt: "var(--tilt-3)" },
  { plate: "pesteh", tilt: "var(--tilt-4)" },
  { plate: "shir-deep", tilt: "var(--tilt-5)" },
  { plate: "anar", tilt: "var(--tilt-6)" },
  { plate: "golab", tilt: "var(--tilt-7)" },
  { plate: "zafaran", tilt: "var(--tilt-8)" },
  { plate: "lajvard", tilt: "var(--tilt-9)" },
];

/**
 * The angle and hue for the item at `index` in the collection.
 *
 * Exported so the related pair at the foot of an item page paints an item in
 * the same colour and at the same angle it wears on the homepage band and on
 * the collection page. One table, three surfaces — otherwise an item is
 * saffron in the box and pistachio at the bottom of its neighbour's page, and
 * nobody can tell whether that is a bug.
 */
export function decorFor(index: number): Decor {
  return DECOR[((index % DECOR.length) + DECOR.length) % DECOR.length];
}

interface Place {
  /** Explicit row and column at every breakpoint. Literal, never composed. */
  place: string;
  /** One of the overlap classes. Applies at lg only. */
  lap?: string;
  /** Expected computed placement, read by the verification pass. */
  expect: { base: [number, number]; md: [number, number]; lg: [number, number] };
}

/** All nine in one grid — the homepage band. */
const PLACE_9: Place[] = [
  {
    place: "row-start-1 col-start-1 md:row-start-1 md:col-start-1 lg:row-start-1 lg:col-start-1",
    expect: { base: [1, 1], md: [1, 1], lg: [1, 1] },
  },
  {
    place: "row-start-2 col-start-1 md:row-start-1 md:col-start-2 lg:row-start-1 lg:col-start-2",
    lap: "tile-lap-a",
    expect: { base: [2, 1], md: [1, 2], lg: [1, 2] },
  },
  {
    place: "row-start-3 col-start-1 md:row-start-2 md:col-start-1 lg:row-start-1 lg:col-start-3",
    expect: { base: [3, 1], md: [2, 1], lg: [1, 3] },
  },
  {
    place: "row-start-4 col-start-1 md:row-start-2 md:col-start-2 lg:row-start-2 lg:col-start-1",
    expect: { base: [4, 1], md: [2, 2], lg: [2, 1] },
  },
  {
    place: "row-start-5 col-start-1 md:row-start-3 md:col-start-1 lg:row-start-2 lg:col-start-2",
    expect: { base: [5, 1], md: [3, 1], lg: [2, 2] },
  },
  {
    place: "row-start-6 col-start-1 md:row-start-3 md:col-start-2 lg:row-start-2 lg:col-start-3",
    lap: "tile-lap-b",
    expect: { base: [6, 1], md: [3, 2], lg: [2, 3] },
  },
  {
    place: "row-start-7 col-start-1 md:row-start-4 md:col-start-1 lg:row-start-3 lg:col-start-1",
    expect: { base: [7, 1], md: [4, 1], lg: [3, 1] },
  },
  {
    place: "row-start-8 col-start-1 md:row-start-4 md:col-start-2 lg:row-start-3 lg:col-start-2",
    lap: "tile-lap-c",
    expect: { base: [8, 1], md: [4, 2], lg: [3, 2] },
  },
  {
    place: "row-start-9 col-start-1 md:row-start-5 md:col-start-1 lg:row-start-3 lg:col-start-3",
    expect: { base: [9, 1], md: [5, 1], lg: [3, 3] },
  },
];

/** One group's run of three, each run its own grid — the collection page. */
const PLACE_3: Place[] = [
  {
    place: "row-start-1 col-start-1 md:row-start-1 md:col-start-1 lg:row-start-1 lg:col-start-1",
    expect: { base: [1, 1], md: [1, 1], lg: [1, 1] },
  },
  {
    place: "row-start-2 col-start-1 md:row-start-1 md:col-start-2 lg:row-start-1 lg:col-start-2",
    lap: "tile-lap-a",
    expect: { base: [2, 1], md: [1, 2], lg: [1, 2] },
  },
  {
    place: "row-start-3 col-start-1 md:row-start-2 md:col-start-1 lg:row-start-1 lg:col-start-3",
    expect: { base: [3, 1], md: [2, 1], lg: [1, 3] },
  },
];

const SIZES = "(max-width: 48rem) 92vw, (max-width: 64rem) 46vw, 31vw";

export function BoxGrid({
  products,
  listLabel,
  /**
   * Position of the first item of this grid within the whole collection, so a
   * run of three keeps its items' own angles and hues.
   */
  offset = 0,
  className,
}: {
  products: readonly ResolvedProduct[];
  listLabel: string;
  offset?: number;
  className?: string;
}) {
  const places = products.length > PLACE_3.length ? PLACE_9 : PLACE_3;

  return (
    <ul
      aria-label={listLabel}
      className={cn(
        "grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product, i) => {
        const place = places[i % places.length];
        const decor = decorFor(i + offset);
        return (
          <li
            key={product.id}
            className={cn(place.place, place.lap)}
            data-tile={product.slug}
            data-grid-base={place.expect.base.join(",")}
            data-grid-md={place.expect.md.join(",")}
            data-grid-lg={place.expect.lg.join(",")}
            data-overlap={place.lap ? "true" : "false"}
          >
            <ProductTile
              product={product}
              plate={decor.plate}
              tilt={decor.tilt}
              sizes={SIZES}
              className="h-full"
            />
          </li>
        );
      })}
    </ul>
  );
}
