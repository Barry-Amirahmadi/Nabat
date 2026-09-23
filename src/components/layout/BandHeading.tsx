import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

interface BandHeadingProps {
  id: string;
  eyebrow: string;
  heading: string;
  lead?: string;
  /** `level` keeps the document outline correct even when the visual size of
   *  the heading stays the same. Never style a heading into the wrong level.
   *  Level 1 is for a page opener — one per document, and only where this
   *  block *is* the page's title rather than a band's. */
  level?: 1 | 2 | 3;
  className?: string;
}

const LEVELS = {
  1: { tag: "h1", type: "t-band" },
  2: { tag: "h2", type: "t-band" },
  3: { tag: "h3", type: "t-name" },
} as const;

/**
 * Band header — stacked, and short.
 *
 * Deliberately not the editorial family's spread, where the heading took half
 * a twelve-column grid and the standfirst sat across the gutter. That
 * arrangement needs empty space on either side of it to read as composition,
 * and there is no empty space on this site: everything is either plate or
 * pattern. Stacked and tight is what survives a loud ground.
 *
 * The lead sits on its own plate because it is body text, and body text never
 * sits directly on pattern. The heading does not, because display type over
 * pattern is allowed and because a heading boxed in a panel stops being a
 * heading. `.plate-own` paints the band's own colour, so the panel is
 * invisible as a panel and visible only as the absence of pattern.
 */
export function BandHeading({
  id,
  eyebrow,
  heading,
  lead,
  level = 2,
  className,
}: BandHeadingProps) {
  const { tag: Tag, type } = LEVELS[level];

  return (
    <div className={cn("flex flex-col items-start gap-4", className)}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>

      <Reveal delay={70}>
        <Tag id={id} className={cn(type, "max-w-[22ch]")}>
          {heading}
        </Tag>
      </Reveal>

      {lead ? (
        <Reveal delay={140} className="plate-own max-w-[var(--measure)] p-4">
          <p className="t-lead">{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
