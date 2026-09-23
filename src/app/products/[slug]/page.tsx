import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publishedProducts, products } from "@/content/products";
import { productSchema } from "@/content/schema";
import { pageMetadata } from "@/lib/seo";
import { ItemHero } from "@/components/products/ItemHero";
import { ItemDetails } from "@/components/products/ItemDetails";
import { ItemViews } from "@/components/products/ItemViews";
import { RelatedItems } from "@/components/products/RelatedItems";
import { OrderBand } from "@/components/home/OrderBand";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * One item.
 *
 * Four bands and the order band, each on a different ground, in the rhythm the
 * homepage sets. The item's own group decides the plate colour and the
 * geometry throughout, so an item page is unmistakably part of the third of
 * the box it came from.
 *
 * What it does *not* have is as deliberate as what it does. No price, no
 * variants, no stock, no invented specification table, no reviews, no rating —
 * none of that exists in the content model. And nothing on this page states an
 * allergen, a diet, a nutrition figure, a certification, an award or a shelf
 * life: those are the claims a reader could act on, and a template that
 * fabricates them to look complete is lying in the one register where the
 * consequence is not aesthetic.
 *
 * `ItemViews` renders nothing for the seven items with no extra photographs,
 * which is why there is no band-shaped hole on those pages.
 */
export function generateStaticParams() {
  return publishedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  return pageMetadata({
    title: product.seo?.title ?? product.name,
    /**
     * Statement *and* description, not one or the other. Either alone is about
     * fifty characters — a search snippet gets truncated at roughly a hundred
     * and sixty, and both sentences together are what the brand already says
     * about the item, so this reads as a description rather than a fragment.
     * Nothing is composed that the copy deck does not contain.
     */
    description:
      product.seo?.description ??
      [product.statement, product.description].filter(Boolean).join(" "),
    path: `/products/${product.slug}/`,
  });
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = publishedProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <>
      <ItemHero product={product} />
      <ItemDetails product={product} />
      <ItemViews product={product} />
      <RelatedItems product={product} all={publishedProducts} />
      <OrderBand />

      {/* Item structured data. Carries no `offers`, no rating, no nutrition
          and no image for the three items whose tile is geometry rather than a
          photograph — see src/content/schema.ts for what is left out and why. */}
      <JsonLd data={productSchema(product)} />
    </>
  );
}
