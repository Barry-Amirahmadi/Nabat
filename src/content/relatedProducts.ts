import type { ResolvedProduct } from "@/types/content";

/**
 * What to show at the bottom of an item page.
 *
 * The rule, in order:
 *
 * 1. Start reading from the item *after* this one and wrap around, so each
 *    page shows a different pair. Taking the first two of the list every time
 *    would make seven of the nine pages recommend the same two items.
 * 2. Prefer the same group. Unlike the five-product template this engine came
 *    from — where every product was alone in its category and this preference
 *    was inert — there are three items in each of three groups here, so the
 *    preference is live: an item page shows the other two members of its own
 *    group, which is the relation the collection actually has.
 *
 * Because rule 2 is now satisfied by exactly two candidates, the heading can
 * be «ادامهٔ جعبه» and mean it, rather than claiming a relation the data does
 * not support.
 */
export function relatedProducts(
  product: ResolvedProduct,
  all: readonly ResolvedProduct[],
  count = 2,
): ResolvedProduct[] {
  const position = all.findIndex((candidate) => candidate.id === product.id);
  if (position === -1) return all.slice(0, count);

  const following = [...all.slice(position + 1), ...all.slice(0, position)];

  return [
    ...following.filter((candidate) => candidate.tone === product.tone),
    ...following.filter((candidate) => candidate.tone !== product.tone),
  ].slice(0, count);
}
