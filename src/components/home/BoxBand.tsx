import Link from "next/link";
import { publishedProducts } from "@/content/products";
import { box } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { BandHeading } from "@/components/layout/BandHeading";
import { BoxGrid } from "@/components/products/BoxGrid";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home band 2 — the box.
 *
 * All nine items at once, rotated, overlapping, on nine plates. The band's own
 * ground is the calmest on the page and its pattern the faintest, because the
 * tiles in front of it are carrying five hues between them — a loud ground
 * here would be the one place on this site where density turns into noise.
 *
 * The grid and its constants live in `BoxGrid`; this band is the heading, the
 * grid and the way out of it.
 */
export function BoxBand() {
  return (
    <Band
      plate="shir"
      pattern={{ id: "box", kind: "dots", hue: "tala", scale: "md", opacity: 0.4 }}
      tilted
      aria-labelledby="box-heading"
    >
      <BandHeading
        id="box-heading"
        eyebrow={box.eyebrow}
        heading={box.heading}
        lead={box.lead}
        className="mb-[var(--band-y-tight)]"
      />

      <BoxGrid products={publishedProducts} listLabel={box.eyebrow} />

      <Reveal className="mt-10">
        <Link href={box.allHref} className="t-group dense-link">
          {box.allLabel}
        </Link>
      </Reveal>
    </Band>
  );
}
