import type { ResolvedProduct } from "@/types/content";
import { productPage } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The reading half of an item page: the four `details` as chips, then the
 * body.
 *
 * The chips are a description list, not a row of styled spans — a label and a
 * value is exactly what `<dl>` is for, and it is what a screen reader needs to
 * read «بافت» and «ترد» as a pair rather than as two loose words.
 *
 * There is no invented row anywhere in this list. Every value restates
 * something the item's own copy already said, and the four labels — مغز،
 * شیرینی، بافت، همراه — are the same four on all nine items because all nine
 * actually have all four. Nothing here states an allergen, a diet, a nutrition
 * figure, a certification or a shelf life: those are the claims a reader could
 * act on, and none of them was supplied by anybody.
 *
 * The body sits on a cream plate in a narrow measure. Pattern behind reading
 * text is the one thing this design does not do.
 */
export function ItemDetails({ product }: { product: ResolvedProduct }) {
  const details = product.details ?? [];
  const body = product.body ?? [];

  if (details.length === 0 && body.length === 0) return null;

  return (
    <Band
      plate="shir-deep"
      pattern={{ id: "details", kind: "border", hue: "tala", scale: "sm", opacity: 0.4 }}
      rhythm="tight"
      aria-labelledby="details-heading"
    >
      <div className="grid grid-cols-1 gap-[var(--band-y-tight)] lg:grid-cols-12">
        <div className="col-start-1 row-start-1 flex flex-col items-start gap-5 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <Eyebrow>{productPage.detailsHeading}</Eyebrow>
          </Reveal>

          <h2 id="details-heading" className="sr-only">
            {productPage.detailsHeading}
          </h2>

          {details.length > 0 ? (
            <Reveal delay={70}>
              <dl className="flex flex-wrap gap-3">
                {details.map((row) => (
                  <div key={row.label} className="chip chip--outline flex-col items-start gap-0">
                    <dt className="t-meta">{row.label}</dt>
                    <dd
                      className="font-medium leading-tight"
                      style={{ fontSize: "var(--text-sm)" }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}
        </div>

        {body.length > 0 ? (
          <Reveal
            delay={140}
            className="plate plate--shir col-start-1 row-start-2 flex flex-col gap-5 p-6 lg:col-span-6 lg:col-start-7 lg:row-start-1"
          >
            {body.map((paragraph) => (
              <p key={paragraph} className="t-body">
                {paragraph}
              </p>
            ))}
          </Reveal>
        ) : null}
      </div>
    </Band>
  );
}
