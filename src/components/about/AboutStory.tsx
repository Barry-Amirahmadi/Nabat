import type { CSSProperties } from "react";
import { about } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { BandHeading } from "@/components/layout/BandHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * The about page's running prose.
 *
 * A narrow column on a patterned ground, interrupted twice by a coloured
 * pull-quote plate. The interruptions are the design: four paragraphs in one
 * measure on a loud ground would be a wall, and the plates give the eye
 * somewhere to land without breaking the reading order — each quote is a
 * `<blockquote>` between two paragraphs, not a floated aside, so a screen
 * reader gets them in the same sequence.
 *
 * **Every paragraph sits on its own cream plate.** Pattern never runs behind
 * reading text on this site; that is the one rule the whole pattern system is
 * subject to, and a page whose entire content is prose is where it would be
 * most tempting to relax it.
 *
 * The quotes are drawn from the paragraphs rather than written separately —
 * both are sentences the copy already contains. A pull-quote that says
 * something the body does not is a second, unedited copy deck.
 */

/** Where each quote lands: after paragraph 1, and after paragraph 3. */
const QUOTE_AFTER = [0, 2] as const;

const QUOTE_PLATES = ["plate plate--anar", "plate plate--pesteh"] as const;
const QUOTE_TILTS = ["var(--tilt-1)", "var(--tilt-4)"] as const;

export function AboutStory() {
  return (
    <Band
      plate="shir-deep"
      pattern={{ id: "about", kind: "border", hue: "tala", scale: "lg", opacity: 0.45 }}
      tilted
      aria-labelledby="about-heading"
    >
      <BandHeading
        id="about-heading"
        level={1}
        eyebrow={about.eyebrow}
        heading={about.heading}
        lead={about.lead}
        className="mb-[var(--band-y-tight)]"
      />

      <div className="flex max-w-[var(--measure)] flex-col gap-6">
        {about.body.map((paragraph, i) => {
          const quoteIndex = QUOTE_AFTER.indexOf(i as (typeof QUOTE_AFTER)[number]);

          return (
            <div key={paragraph} className="flex flex-col gap-6">
              <Reveal className="plate plate--shir p-6">
                <p className="t-body">{paragraph}</p>
              </Reveal>

              {quoteIndex !== -1 && about.quotes[quoteIndex] ? (
                <Reveal
                  delay={80}
                  className={cn("pull-quote tilt", QUOTE_PLATES[quoteIndex])}
                  style={{ "--tilt": QUOTE_TILTS[quoteIndex] } as CSSProperties}
                >
                  <blockquote className="t-quote">{about.quotes[quoteIndex]}</blockquote>
                </Reveal>
              ) : null}
            </div>
          );
        })}
      </div>
    </Band>
  );
}
