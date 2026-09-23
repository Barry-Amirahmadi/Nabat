import Link from "next/link";
import type { CSSProperties } from "react";
import type { ResolvedProduct } from "@/types/content";
import { GROUP_STYLE, productAnchor } from "@/content/groups";
import { box } from "@/content/sections";
import { cn } from "@/lib/cn";
import { Pattern } from "@/components/pattern/Pattern";
import { SweetImage } from "@/components/ui/SweetImage";
import type { PlateHue } from "@/components/layout/Band";

/**
 * One item, as a tile.
 *
 * The same component on the homepage band and on the collection page: the two
 * surfaces differ in grouping and completeness, not in how an item looks, and
 * two tile components would be two places for the tile to drift.
 *
 * **Three of the nine items carry no photograph at all.** Those tiles are
 * pattern and type only — the group's own geometry fills the frame where a
 * picture would be. This is not a fallback for a missing file: it is the
 * design decision that lets the site ship with eight images instead of fifty,
 * and it is why the frame is still a square of exactly the same size. The
 * item's `image` in those cases is a decorative pattern plate with an empty
 * `alt`, which is what marks it as not-a-photograph, here and in the
 * structured data.
 *
 * The plate colour is positional, handed in by the grid — the nine tiles run
 * through five hues so the band is many-coloured, which is the whole point of
 * band 2. The *pattern* is the group's, taken from `tone`. So colour varies
 * across the box and geometry tells you which third of it you are looking at.
 */

const PLATES: Record<PlateHue, string> = {
  shir: "plate--shir",
  "shir-deep": "plate--shir-deep",
  zafaran: "plate--zafaran",
  golab: "plate--golab",
  anar: "plate--anar",
  pesteh: "plate--pesteh",
  lajvard: "plate--lajvard",
  ink: "plate--ink",
  none: "",
};

interface ProductTileProps {
  product: ResolvedProduct;
  plate: PlateHue;
  /** A `var(--tilt-n)` token name. Never a computed or random angle. */
  tilt: string;
  sizes: string;
  className?: string;
}

export function ProductTile({ product, plate, tilt, sizes, className }: ProductTileProps) {
  const headingId = productAnchor(product.slug);
  const href = `/products/${product.slug}/`;
  /** An empty `alt` marks a decorative pattern plate rather than a picture. */
  const hasPhotograph = product.image.alt.trim() !== "";
  const geometry = GROUP_STYLE[product.tone].pattern;

  return (
    <article
      id={headingId}
      aria-labelledby={`${headingId}-name`}
      className={cn("tile tilt plate", PLATES[plate], className)}
      style={{ "--tilt": tilt } as CSSProperties}
    >
      {hasPhotograph ? (
        <SweetImage media={product.image} sizes={sizes} />
      ) : (
        <div
          className="pattern-host img-frame"
          style={{ aspectRatio: "1 / 1", backgroundColor: "var(--plate-bg)" }}
        >
          <Pattern id={`tile-${product.slug}`} kind={geometry} hue="tala" scale="sm" />
        </div>
      )}

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <h3 id={`${headingId}-name`} className="t-name">
          <Link href={href} className="tile__link">
            <span className="tile__link-text">{product.name}</span>
            {/* The link's accessible name is the item name plus what pressing
                it does. `linkLabel` is in the copy deck, so the words are
                editable and the markup carries no second copy of them. */}
            <span className="sr-only"> — {box.linkLabel}</span>
          </Link>
        </h3>

        <p className="t-body text-[0.9375rem]">{product.description}</p>
        <p className="t-meta mt-auto pt-2">{product.category}</p>
      </div>
    </article>
  );
}
