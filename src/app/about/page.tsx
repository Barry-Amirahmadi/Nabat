import { about } from "@/content/sections";
import { pageMetadata } from "@/lib/seo";
import { AboutStory } from "@/components/about/AboutStory";
import { OrderBand } from "@/components/home/OrderBand";

/**
 * About — one page, and it is short.
 *
 * Four paragraphs of position: why the box holds nine, why there are three
 * groups, where the colours came from, where the geometry came from. No
 * founding year, no founder, no shop history, no «since» — none of that was
 * supplied, and an about page that invents a company history to fill itself is
 * telling the same kind of lie as a fabricated certification, just in prose.
 *
 * It closes with the order band rather than a link to it: contact details are
 * what a reader wants at the end of an about page, and that band already holds
 * all of them.
 */
export const metadata = pageMetadata({
  title: about.seo.title,
  description: about.seo.description,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <AboutStory />
      <OrderBand />
    </>
  );
}
