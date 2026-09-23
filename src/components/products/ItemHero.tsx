import Link from "next/link";
import type { CSSProperties } from "react";
import type { ResolvedProduct } from "@/types/content";
import { GROUP_STYLE, groupAnchor, groups } from "@/content/groups";
import { inquiry, productPage } from "@/content/sections";
import { site } from "@/content/site";
import { fillTemplate, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Band } from "@/components/layout/Band";
import { Pattern } from "@/components/pattern/Pattern";
import { SweetImage } from "@/components/ui/SweetImage";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The top of an item page: breadcrumb, the photograph on a patterned plate,
 * the name at display scale, the statement, and the order link.
 *
 * The plate and the geometry are the item's group's, so an item page is
 * unmistakably part of the third of the box it came from.
 *
 * **The breadcrumb uses `next/link`, not a bare `<a>`.** A raw `href="/"`
 * skips the deployment base path and leaves the site entirely — on a GitHub
 * Pages project site it lands on `user.github.io` rather than on
 * `user.github.io/nabat/`. That is a defect the template this engine came
 * from shipped and now has a test for.
 */

const PLATES = {
  zafaran: "plate--zafaran",
  golab: "plate--golab",
  lajvard: "plate--lajvard",
  anar: "plate--anar",
  pesteh: "plate--pesteh",
} as const;

export function ItemHero({ product }: { product: ResolvedProduct }) {
  const style = GROUP_STYLE[product.tone];
  const group = groups.find((g) => g.key === product.tone);
  /** An empty `alt` marks a decorative pattern plate rather than a picture. */
  const hasPhotograph = product.image.alt.trim() !== "";

  const chat = whatsappLink(
    site.contact.whatsapp,
    fillTemplate(inquiry.message, { product: product.name }),
  );

  return (
    <Band
      plate="shir"
      pattern={{ id: "item", kind: style.pattern, hue: "tala", scale: "md", opacity: 0.4 }}
      tilted
      aria-labelledby="item-heading"
    >
      <nav aria-label={productPage.breadcrumbLabel} className="mb-8">
        <ol className="on-band inline-flex flex-wrap items-center gap-x-3">
          <li>
            <Link href="/" className="t-meta crumb dense-link">
              {productPage.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true" className="t-meta">
            ·
          </li>
          <li>
            <Link href="/products/" className="t-meta crumb dense-link">
              {productPage.breadcrumbCollection}
            </Link>
          </li>
          <li aria-hidden="true" className="t-meta">
            ·
          </li>
          <li className="t-meta crumb" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 items-start gap-[var(--band-y-tight)] lg:grid-cols-12">
        {/* The picture sits on the group's plate, tilted. Explicit row and
            column, like every cell on this site. */}
        <Reveal
          className={cn(
            "tilt plate col-start-1 row-start-1 p-3 lg:col-span-5 lg:col-start-1 lg:row-start-1",
            PLATES[style.plate],
          )}
          style={{ "--tilt": "var(--tilt-3)" } as CSSProperties}
        >
          {hasPhotograph ? (
            <SweetImage media={product.image} sizes="(max-width: 64rem) 90vw, 40vw" priority />
          ) : (
            <div
              className="pattern-host img-frame"
              style={{ aspectRatio: "1 / 1", backgroundColor: "var(--plate-bg)" }}
            >
              <Pattern
                id={`item-plate-${product.slug}`}
                kind={style.pattern}
                hue="tala"
                scale="md"
              />
            </div>
          )}
        </Reveal>

        <div className="col-start-1 row-start-2 flex flex-col items-start gap-5 lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <Reveal>
            <h1 id="item-heading" className="t-band">
              {product.name}
            </h1>
          </Reveal>

          <Reveal delay={70} className="flex flex-wrap items-center gap-3">
            <span className={cn("chip plate", PLATES[style.plate])}>{product.category}</span>
            {/* On the band rather than in a block, so it needs its own patch of
                the band's colour — see `.on-band`. */}
            <span className="t-meta on-band inline-flex" dir="ltr">
              {product.latin}
            </span>
          </Reveal>

          {product.statement ? (
            <Reveal delay={140} className="plate-own max-w-[var(--measure)] p-4">
              <p className="t-lead">{product.statement}</p>
            </Reveal>
          ) : null}

          <Reveal delay={210}>
            <Button href={chat} external>
              {inquiry.label}
            </Button>
          </Reveal>

          {group ? (
            <Reveal delay={280}>
              <Link href={`/products/#${groupAnchor(group.key)}`} className="t-meta dense-link on-band">
                {productPage.backLabel}
              </Link>
            </Reveal>
          ) : null}
        </div>
      </div>
    </Band>
  );
}
