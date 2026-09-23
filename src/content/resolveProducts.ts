import type { GroupKey, Product, ResolvedProduct } from "@/types/content";
import { groups } from "./groups";

/**
 * Fills in the presentation field a CMS editor can leave empty.
 *
 * **`tone` is repurposed on this site, and this is the file the brief asks to
 * have it documented in.** In the editorial template it was a per-item hex
 * colour driving an ambient wash behind the product showcase. Here it is the
 * item's *group key*, and the group registry in `groups.ts` turns that key
 * into a plate colour and a pattern geometry. One field, two jobs replaced:
 * an item's colour and an item's pattern are now both consequences of which
 * group it is in, which is why a group header and its members can no longer
 * end up in different colours.
 *
 * The field stayed optional for the same reason it was optional before: a CMS
 * lets someone save an item without filling every box, and an undefined group
 * would mean an item with no plate colour, no pattern and no place in the
 * collection index — a blank tile rather than a visible mistake.
 */

/**
 * Group for an item with no `tone`.
 *
 * Positional, in threes. The collection is nine items in three groups of
 * three, so an unassigned item lands in the group its position implies rather
 * than in a fixed default that would pile every unassigned item into one
 * group and leave the other two short.
 *
 * `groups` is the ordered registry, so this follows the editor's own group
 * order rather than the key order of a record literal.
 */
function fallbackGroup(index: number): GroupKey {
  const position = Math.floor(index / 3) % groups.length;
  return groups[position].key;
}

export function resolveProduct(product: Product, index: number): ResolvedProduct {
  return {
    ...product,
    tone: product.tone ?? fallbackGroup(index),
  };
}

/**
 * Position matters: the fallback is by index, so the list handed in must be
 * the one that actually renders, in render order. Resolving a filtered list
 * and an unfiltered one would put the same item in different groups.
 */
export function resolveProducts(list: readonly Product[]): ResolvedProduct[] {
  return list.map(resolveProduct);
}
