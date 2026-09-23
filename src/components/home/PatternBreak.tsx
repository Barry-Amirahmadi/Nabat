import { patternBreak } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home band 3 — the pattern break.
 *
 * Nothing but geometry and one sentence. No product, no photograph, no
 * heading, no link. Its whole job is to stop the page: two bands of dense,
 * many-coloured plates on either side of a band that is only a pattern.
 *
 * **This is the only place on the site where type is knocked straight out of
 * a pattern rather than off a plate**, and the pattern's stroke colour was
 * chosen for that and nothing else. Gold — the pattern-native stroke
 * everywhere else on the site — reverses cream at 2.29:1 and could not be
 * used here at any size. The lighter lapis in `--color-lapis-light` reverses
 * cream at 5.24:1, which clears even the body-text floor, while still reading
 * as pattern against the lapis ground at 1.80:1.
 *
 * The line is set in Rakkas, the second display face, and it is the largest
 * thing on the page after the poster wordmark.
 */
export function PatternBreak() {
  return (
    <Band
      plate="lajvard"
      pattern={{ id: "break", kind: "arch", hue: "lapis-light", scale: "lg" }}
      aria-label={patternBreak.line}
    >
      <Reveal>
        <p className="t-quote max-w-[24ch]" style={{ fontSize: "var(--text-band)" }}>
          {patternBreak.line}
        </p>
      </Reveal>
    </Band>
  );
}
