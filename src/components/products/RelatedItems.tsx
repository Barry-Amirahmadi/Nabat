import type { ResolvedProduct } from "@/types/content";
import { GROUP_STYLE } from "@/content/groups";
import { productPage } from "@/content/sections";
import { relatedProducts } from "@/content/relatedProducts";
import { Band } from "@/components/layout/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductTile } from "./ProductTile";
import { decorFor } from "./BoxGrid";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * The rest of this item's group, at the foot of its page.
 *
 * `relatedProducts` prefers the same group and there are exactly two other
 * members of it, so the heading «ادامهٔ جعبه» is a statement about the data
 * rather than a hopeful label. Each tile keeps the colour and angle it has
 * everywhere else — see `decorFor`.
 *
 * Two cells, and both carry an explicit row and column at both breakpoints.
 * Two items in a two-column grid is the case where sparse auto-placement looks
 * harmless, which is exactly why it is written out: the rule on this site is
 * that no cell is ever placed by the algorithm, so there is no grid to
 * remember an exception for.
 */

const PLACE = [
  "row-start-1 col-start-1 md:row-start-1 md:col-start-1",
  "row-start-2 col-start-1 md:row-start-1 md:col-start-2",
] as const;

export function RelatedItems({
  product,
  all,
}: {
  product: ResolvedProduct;
  all: readonly ResolvedProduct[];
}) {
  const related = relatedProducts(product, all);
  if (related.length === 0) return null;

  const style = GROUP_STYLE[product.tone];

  return (
    <Band
      plate="shir-deep"
      pattern={{
        id: "related",
        kind: style.pattern,
        hue: "tala",
        scale: "md",
        opacity: 0.35,
      }}
      rhythm="tight"
      aria-labelledby="related-heading"
    >
      <div className="mb-8">
        <Reveal className="flex flex-col items-start gap-3">
          <Eyebrow>{productPage.relatedHeading}</Eyebrow>
          <h2 id="related-heading" className="t-group">
            {productPage.relatedHeading}
          </h2>
        </Reveal>
      </div>

      <ul className="grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2">
        {related.map((item, i) => {
          const decor = decorFor(all.findIndex((candidate) => candidate.id === item.id));

          return (
            <li key={item.id} className={cn("flex", PLACE[i] ?? PLACE[0])}>
              <Reveal delay={i * 90} className="flex w-full">
                <ProductTile
                  product={item}
                  plate={decor.plate}
                  tilt={decor.tilt}
                  sizes="(max-width: 48rem) 92vw, 44vw"
                  className="w-full"
                />
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
