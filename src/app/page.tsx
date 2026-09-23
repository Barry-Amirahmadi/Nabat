import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { Poster } from "@/components/home/Poster";
import { BoxBand } from "@/components/home/BoxBand";
import { PatternBreak } from "@/components/home/PatternBreak";
import { GroupBands } from "@/components/home/GroupBands";
import { OrderBand } from "@/components/home/OrderBand";

/**
 * Homepage — five bands, and every one of them sits on pattern.
 *
 *   1 POSTER        cream ground, tile geometry, the name at display scale,
 *                   three rotated badges, one photograph offset over band 2
 *   2 THE BOX       nine rotated tiles in five hues, three breaking the grid
 *   3 PATTERN BREAK one full-width field of geometry, one line reversed out
 *   4 THREE GROUPS  three wide blocks, each its own hue and its own geometry
 *   5 ORDER         ink ground, stacked blocks of contrasting colour
 *
 * None of it is a hero image over a headline, and none of it is a row of
 * uniform cards. The two earlier design languages in this family both open
 * with a full-bleed photograph and follow it with a centred statement; this
 * opens with type on geometry and follows it with nine things at once. The
 * photograph appears third in the reading order and does not fill anything.
 *
 * Band 1 reaches into band 2 — that overlap is the reason both bands are
 * stacking contexts and the reason the poster carries a `z-index` at all. See
 * the note over `.poster` in `components.css`: two sibling stacking contexts
 * at `z-index: auto` paint in document order, so without it band 2 would
 * paint its own plate straight over anything band 1 pushed down, and the
 * negative margin would have looked like it did nothing at all.
 */

/** No `title`: the homepage *is* the site title, not a page within it. */
export const metadata = pageMetadata({
  description: site.seo.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Poster />
      <BoxBand />
      <PatternBreak />
      <GroupBands />
      <OrderBand />
    </>
  );
}
