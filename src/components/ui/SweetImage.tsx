import Image from "next/image";
import type { CSSProperties } from "react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";
import { withBasePath } from "@/lib/basePath";

/**
 * The only way a photograph enters this site.
 *
 * Owns the crop and the loading strategy, so every picture on the page is
 * treated identically — which is what makes eight unrelated files read as one
 * shoot. There is no settle animation, unlike the editorial template: the
 * reveal on this site is a stamp applied to the whole plate, and a second
 * transform inside the image would fight it.
 *
 * Images are served unoptimized because a static host has no optimisation
 * server. That also means Next does not prefix the deployment base path onto
 * the `src`, so it goes through `withBasePath()` here — the single chokepoint
 * every image on the site passes through. On a GitHub Pages project site,
 * skipping it asks for `/media/p-01.jpg` while the file is served at
 * `/nabat/media/p-01.jpg`, which looks perfect in every build without a base
 * path and breaks all of them with one.
 */
export function SweetImage({
  media,
  sizes,
  /** Only the poster image should set this. */
  priority = false,
  className,
}: {
  media: MediaAsset;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("img-frame", className)}
      style={{ aspectRatio: media.ratio.replace("/", " / ") } as CSSProperties}
    >
      <Image
        src={withBasePath(media.src)}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        /* A vector is nothing for a raster optimiser to do work on, and the
           placeholders are vectors until the extension in content/media.ts
           changes. Derived from the file rather than from a flag, so a mixed
           set during the swap is still correct per file. */
        unoptimized={media.src.endsWith(".svg")}
        className="img-fill"
      />
    </div>
  );
}
