import type { Product } from "@/types/content";
import { site } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

/**
 * Schema.org mappings.
 *
 * Every field below reads straight off the content model. Nothing is invented
 * to satisfy a schema, which is the whole discipline here — structured data is
 * the easiest place on a site to assert something false, because no reader
 * ever sees it and the vocabulary invites you to fill in a shape.
 *
 * What that rules out, specifically:
 *
 * - **No `offers`.** No price, currency, availability or seller exists, and
 *   this site has no commerce at all. Google will not render a product rich
 *   result without one; a fabricated price to earn that snippet would be a lie
 *   told to a search engine about a business.
 * - **No `aggregateRating` or `review`.** There are no reviews.
 * - **No `nutrition`, no `suitableForDiet`, no allergen field.** Schema.org
 *   has vocabulary for all three and this is exactly the place a generator
 *   would fill them in. A dietary claim in structured data is still a dietary
 *   claim, and it is the class of claim a reader can act on and be harmed by.
 * - **No `sameAs`** on the organisation. The handles are deliberate
 *   `.example` placeholders; `sameAs` asserts "this organisation *is* that
 *   account", which would be a false claim about URLs that do not resolve.
 * - **No `logo`.** No logo asset exists. `image` carries the share card,
 *   which is what it is.
 */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand.name,
    alternateName: site.brand.latin,
    url: absoluteUrl("/"),
    description: site.seo.description,
    image: absoluteUrl(site.seo.ogImage.src),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contact.city,
      addressCountry: "IR",
    },
  };
}

export function productSchema(product: Product): Record<string, unknown> {
  /**
   * Three of the nine items carry no photograph: their `image` is a
   * decorative pattern plate, marked as such by an empty `alt`. Pointing
   * `schema:image` at a plate of geometry would tell a crawler "this is a
   * picture of the item", which it is not — so the field is omitted for those
   * three rather than filled with the nearest available file. An absent field
   * is better than a field that is wrong.
   */
  const hasPhotograph = product.image.alt.trim() !== "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo?.description ?? product.description,
    category: product.category,
    url: absoluteUrl(`/products/${product.slug}/`),
    ...(hasPhotograph ? { image: absoluteUrl(product.image.src) } : {}),
    brand: { "@type": "Brand", name: site.brand.name },
  };
}
