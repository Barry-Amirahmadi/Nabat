"use client";

import type { CSSProperties } from "react";
import type { GalleryItem } from "@/types/content";
import { galleryPage } from "@/content/sections";
import { SweetImage } from "@/components/ui/SweetImage";
import { cn } from "@/lib/cn";

interface GalleryTileProps {
  item: GalleryItem;
  sizes: string;
  /** A `plate--*` class. Positional, handed in by the wall. */
  plate: string;
  /** A `var(--tilt-n)` token name. Never a computed or random angle. */
  tilt: string;
  onOpen: () => void;
  className?: string;
}

/**
 * One picture on the wall.
 *
 * The card is a plate and the caption sits on it, not on the band — a caption
 * on the band would have the band's geometry running through it, which is the
 * one thing the pattern system is not allowed to do.
 *
 * A real `<button>`, because pressing it opens a dialog rather than going
 * anywhere; that also makes it keyboard-reachable and correctly announced with
 * no ARIA at all. Its accessible name is the enlarge verb plus the picture's
 * title, both from the copy deck — the markup holds no second copy of either.
 *
 * `cursor: pointer` is declared on it explicitly. The template this engine
 * came from computes `default` here, because its reset sets the cursor on a
 * different element; that is a live defect there and reproducing it is
 * forbidden, so the property is on the control itself and the verification
 * pass reads the computed value rather than trusting the reset.
 */
export function GalleryTile({
  item,
  sizes,
  plate,
  tilt,
  onOpen,
  className,
}: GalleryTileProps) {
  return (
    <figure
      className={cn("gallery-card tilt plate", plate, className)}
      style={{ "--tilt": tilt } as CSSProperties}
    >
      <button type="button" onClick={onOpen} className="gallery-tile">
        <SweetImage media={item.image} sizes={sizes} />
        <span className="sr-only">
          {galleryPage.viewLabel} — {item.title}
        </span>
      </button>

      <figcaption className="gallery-tile__meta">
        <span className="t-meta" style={{ color: "var(--on-plate)" }}>
          {item.title}
        </span>
        <span className="t-meta">{item.caption ?? item.category}</span>
      </figcaption>
    </figure>
  );
}
