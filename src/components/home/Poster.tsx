import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { poster } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { Button } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { SweetImage } from "@/components/ui/SweetImage";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home band 1 — the poster.
 *
 * Not a hero. There is no image-led masthead, no standfirst paragraph and no
 * scroll hint: this is a printed poster for a confectioner's window, so it is
 * a name at display scale, two short lines, three stickers and a way in.
 *
 * The brand name is the page's `h1` and the only element on the site set at
 * `--text-brand`. One photograph sits offset at the end edge and breaks the
 * bottom boundary into the band below — see `.poster__photo` in
 * components.css for why that needs a `z-index` on the band and not just a
 * negative margin.
 *
 * The heading and the claim sit straight on the pattern, which is allowed for
 * display type. The two badges' and the buttons' own plates are solid, so
 * nothing small is ever read against geometry.
 */
export function Poster() {
  const hues = ["zafaran", "anar", "pesteh"] as const;

  return (
    <Band
      plate="shir"
      pattern={{ id: "poster", kind: "tile", hue: "tala", scale: "lg", opacity: 0.55 }}
      tilted
      className="poster"
      aria-labelledby="poster-heading"
    >
      <div className="grid grid-cols-1 items-start gap-[var(--grid-gap)] lg:grid-cols-12">
        <div className="col-start-1 row-start-1 flex flex-col items-start gap-6 lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <h1 id="poster-heading" className="t-brand">
              {site.brand.name}
            </h1>
          </Reveal>

          <Reveal delay={80} className="flex flex-col gap-1">
            {poster.claim.map((line) => (
              <p key={line} className="t-band max-w-[20ch]">
                {line}
              </p>
            ))}
          </Reveal>

          <Reveal delay={160} className="flex flex-wrap items-center gap-4 pt-2">
            {poster.badges.map((badge, i) => (
              <Sticker key={badge} hue={hues[i]} index={i as 0 | 1 | 2}>
                {badge}
              </Sticker>
            ))}
          </Reveal>

          <Reveal delay={240} className="flex flex-wrap items-center gap-3 pt-2">
            <Button href={poster.primary.href}>{poster.primary.label}</Button>
            <Button href={poster.secondary.href} variant="ghost">
              {poster.secondary.label}
            </Button>
          </Reveal>
        </div>

        {/* Explicit row and column, like every other cell on this site: this
            one asks for column 9 after a cell in column 1, which is exactly
            the shape that gets pushed into an implicit row when left to
            auto-placement. */}
        <Reveal
          delay={120}
          className="poster__photo tilt col-start-1 row-start-2 lg:col-span-4 lg:col-start-9 lg:row-start-1"
          style={{ "--tilt": "var(--tilt-4)" } as CSSProperties}
        >
          <SweetImage
            media={poster.image}
            sizes="(max-width: 64rem) 90vw, 32vw"
            priority
            className="shadow-[var(--shadow-lift)]"
          />
        </Reveal>
      </div>
    </Band>
  );
}
