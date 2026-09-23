import { notFound } from "@/content/sections";
import { Band } from "@/components/layout/Band";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/**
 * 404.
 *
 * On the same geometry as everything else, because a reader who lands here has
 * not left the site — the page that says so should look like the site. One way
 * out, not a menu of guesses.
 *
 * Exported statically as `/404.html`, which is the file GitHub Pages serves
 * for an unmatched path. That is the whole reason this route matters on this
 * host, and it is checked live: a 404 page that itself 404s is the failure
 * mode nobody notices until a shared link goes stale.
 */
export default function NotFound() {
  return (
    <Band
      plate="shir"
      pattern={{ id: "notfound", kind: "arch", hue: "tala", scale: "lg", opacity: 0.45 }}
      tilted
      aria-labelledby="notfound-heading"
    >
      <div className="flex max-w-[var(--measure)] flex-col items-start gap-6">
        <Reveal>
          <Eyebrow>{notFound.eyebrow}</Eyebrow>
        </Reveal>

        <Reveal delay={70}>
          <h1 id="notfound-heading" className="t-band">
            {notFound.heading}
          </h1>
        </Reveal>

        <Reveal delay={140} className="plate-own p-4">
          <p className="t-lead">{notFound.lead}</p>
        </Reveal>

        <Reveal delay={210}>
          <Button href={notFound.action.href}>{notFound.action.label}</Button>
        </Reveal>
      </div>
    </Band>
  );
}
