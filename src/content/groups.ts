import type { GroupKey, GroupStyle, ProductGroup, ResolvedProduct } from "@/types/content";

/**
 * The three groups, and the plate colour and pattern geometry each one owns.
 *
 * This registry is what `tone` was repurposed into. In the editorial template
 * `tone` was a hex colour per product, driving an ambient wash; here it is a
 * group key, and the group — not the individual item — owns the presentation.
 * The reason is that a colour authored per item drifts: nine items each
 * picking their own hue produces three group headers whose colour agrees with
 * none of their members. One key, one lookup, and a group and its items can
 * never disagree.
 *
 * `plate` names a token from tokens.css and a `.plate--*` modifier from
 * globals.css, so a group's colour still cannot be spelled as a literal
 * anywhere. All three are plates whose measured ratios allow the text they
 * carry: saffron takes ink at 8.81:1, rosewater ink at 7.65:1, lapis cream
 * at 9.45:1.
 */
export const GROUP_STYLE: Record<GroupKey, GroupStyle> = {
  khoshk: { plate: "zafaran", pattern: "tile" },
  tar: { plate: "golab", pattern: "dots" },
  ghand: { plate: "lajvard", pattern: "arch" },
};

/**
 * Group names and the one line each carries on its block.
 *
 * Order is the order the collection is read in, and it is the editor's: dry
 * first, then the creamed things, then pure sugar. Nothing re-sorts it.
 */
export const groups: ProductGroup[] = [
  {
    key: "khoshk",
    name: "خشک و مغزدار",
    line: "مغزدار و ترد، برای کنار چای.",
  },
  {
    key: "tar",
    name: "تر و خامه‌ای",
    line: "خامه و گلاب، تازه و نرم.",
  },
  {
    key: "ghand",
    name: "قند و نبات",
    line: "شیرینِ خالص، برای استکان چای.",
  },
];

/** The one place an item's on-page element id is spelled. */
export function productAnchor(slug: string): string {
  return `item-${slug}`;
}

/** The one place a group's on-page element id is spelled. */
export function groupAnchor(key: GroupKey): string {
  return `group-${key}`;
}

export interface GroupRun {
  group: ProductGroup;
  items: ResolvedProduct[];
}

/**
 * The collection, cut into its three runs.
 *
 * Derived rather than authored, so a group can never claim a count it does not
 * have and an item can never be listed under a group it is not in. A group
 * with no published members is dropped entirely rather than rendering an empty
 * header — which is what would happen the first time an editor unpublishes the
 * last item in a group.
 */
export function groupRuns(list: readonly ResolvedProduct[]): GroupRun[] {
  return groups
    .map((group) => ({ group, items: list.filter((item) => item.tone === group.key) }))
    .filter((run) => run.items.length > 0);
}
