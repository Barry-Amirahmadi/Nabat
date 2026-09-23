import type { CSSProperties } from "react";
import type { ResolvedProduct } from "@/types/content";
import { GROUP_STYLE } from "@/content/groups";
import { productPage } from "@/content/sections";
import { cn } from "@/lib/cn";
import { Band } from "@/components/layout/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SweetImage } from "@/components/ui/SweetImage";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The extra photographs, where an item has any.
 *
 * Only two of the nine do — نان خامه‌ای and نبات زعفرانی — which is why this
 * renders nothing at all rather than a heading over an empty row. `views` is
 * optional in the content model precisely so that the seven items without one
 * need no placeholder, and a band that appears only when there is something
 * in it is the difference between an optional field and a field with a hole
 * in it.
 */

const PLATES = {
  zafaran: "plate--zafaran",
  golab: "plate--golab",
  lajvard: "plate--lajvard",
  anar: "plate--anar",
  pesteh: "plate--pesteh",
} as const;

export function ItemViews({ product }: { product: ResolvedProduct }) {
  const views = product.views ?? [];
  if (views.length === 0) return null;

  const style = GROUP_STYLE[product.tone];

  return (
    <Band
      plate="shir"
      pattern={{ id: "views", kind: "dots", hue: "tala", scale: "sm", opacity: 0.4 }}
      rhythm="tight"
      tilted
      aria-labelledby="views-heading"
    >
      <div className="mb-8 flex flex-col items-start gap-3">
        <Eyebrow>{productPage.viewsHeading}</Eyebrow>
        <h2 id="views-heading" className="sr-only">
          {productPage.viewsHeading}
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2">
        {views.map((view, i) => (
          <li
            key={view.src}
            className={cn(
              "row-start-1 col-start-1",
              i === 1 && "row-start-2 col-start-1 md:row-start-1 md:col-start-2",
            )}
          >
            <Reveal
              className={cn("tilt plate p-3", PLATES[style.plate])}
              style={
                { "--tilt": i === 0 ? "var(--tilt-2)" : "var(--tilt-8)" } as CSSProperties
              }
            >
              <SweetImage media={view} sizes="(max-width: 48rem) 92vw, 46vw" />
              {view.caption ? <p className="t-meta pt-2">{view.caption}</p> : null}
            </Reveal>
          </li>
        ))}
      </ul>
    </Band>
  );
}
