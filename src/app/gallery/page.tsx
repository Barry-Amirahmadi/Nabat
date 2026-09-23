import { pageMetadata } from "@/lib/seo";
import { galleryPage } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { BandHeading } from "@/components/layout/BandHeading";
import { GalleryWall } from "@/components/gallery/GalleryWall";
import { OrderBand } from "@/components/home/OrderBand";

/**
 * Gallery.
 *
 * The masthead and the wall share one band, on the coarsest pattern scale on
 * the site — the geometry has to stay legible behind cards of six different
 * sizes, and a fine tile behind an uneven wall reads as noise rather than as
 * ground.
 *
 * This is the one route where the family's uniformity rule is deliberately
 * suspended: eight cards at three widths, each rotated, each on its own hue.
 * Everywhere else a frame that changes size per item reads as a mistake; here
 * the unevenness *is* the composition. See the placement note in `GalleryWall`
 * for why every cell still states its row and column explicitly — an uneven
 * grid is exactly where sparse auto-placement silently opens holes.
 */
export const metadata = pageMetadata({
  title: galleryPage.seo.title,
  description: galleryPage.seo.description,
  path: "/gallery/",
});

export default function GalleryPage() {
  return (
    <>
      <Band
        plate="shir"
        pattern={{ id: "gallery", kind: "tile", hue: "tala", scale: "lg", opacity: 0.4 }}
        tilted
        aria-labelledby="gallery-page-heading"
      >
        <BandHeading
          id="gallery-page-heading"
          level={1}
          eyebrow={galleryPage.eyebrow}
          heading={galleryPage.heading}
          lead={galleryPage.lead}
          className="mb-[var(--band-y-tight)]"
        />

        <GalleryWall />
      </Band>

      <OrderBand />
    </>
  );
}
