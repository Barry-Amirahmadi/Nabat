import { publishedProducts } from "@/content/products";
import { groupRuns } from "@/content/groups";
import { collection } from "@/content/sections";
import { pageMetadata } from "@/lib/seo";
import { Band } from "@/components/layout/Band";
import { BandHeading } from "@/components/layout/BandHeading";
import { GroupIndex } from "@/components/products/GroupIndex";
import { GroupRun } from "@/components/products/GroupRun";
import { OrderBand } from "@/components/home/OrderBand";

/**
 * The collection — the same nine items as the homepage band, complete and cut
 * into their three groups.
 *
 * The difference between this page and band 2 is the point. The band hands you
 * the box as one object: nine things at once, in five colours, at nine angles.
 * This is the register of what is in it — three headed runs, each on its own
 * geometry, so a reader can enter at the group they came for.
 *
 * `groupRuns` derives the runs from the items' own `tone`, so a group cannot
 * claim a count it does not have and an empty group never renders a header.
 * `offset` carries each run's starting position in the whole collection
 * through to the grid, which is what keeps an item's colour and angle the same
 * here as on the homepage.
 *
 * The order band is the same component the homepage closes with. It is the
 * conversion on this site — a phone call or a WhatsApp message — and repeating
 * it here is cheaper for the reader than a link back to the homepage to find
 * it. Its `id="order"` is why `/#order` in the navigation points at the
 * homepage explicitly rather than at the current page.
 */
export const metadata = pageMetadata({
  title: collection.seo.title,
  description: collection.seo.description,
  path: "/products/",
});

export default function CollectionPage() {
  const products = publishedProducts;
  const runs = groupRuns(products);

  /** Each run's starting index in the full collection, accumulated in order. */
  const offsets: number[] = [];
  runs.reduce((carried, run) => {
    offsets.push(carried);
    return carried + run.items.length;
  }, 0);

  return (
    <>
      <Band
        plate="shir"
        pattern={{ id: "collection", kind: "arch", hue: "tala", scale: "lg", opacity: 0.4 }}
        rhythm="tight"
        tilted
        aria-labelledby="collection-heading"
      >
        <BandHeading
          id="collection-heading"
          level={1}
          eyebrow={collection.eyebrow}
          heading={collection.heading}
          lead={collection.lead}
        />
        <GroupIndex runs={runs} total={products.length} />
      </Band>

      {runs.map((run, i) => (
        <GroupRun key={run.group.key} run={run} index={i} offset={offsets[i]} />
      ))}

      <OrderBand />
    </>
  );
}
