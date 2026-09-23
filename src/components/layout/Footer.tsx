import Link from "next/link";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { Pattern } from "@/components/pattern/Pattern";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The colophon.
 *
 * An ink plate under gold geometry — the one place the pattern is allowed to
 * be nearly the whole design, because everything on it is a short label or a
 * link rather than a paragraph to read. Cream on ink measures 16.92:1, so the
 * pattern can run at a quarter strength behind the grid and every line still
 * clears AAA by a wide margin.
 *
 * **There is no form here and adding one needs a backend first.** The template
 * this engine came from shipped a newsletter field with `action="#"` and no
 * method: submitting it reloaded the page, lost the reader's place, and put a
 * typed email address into the URL — and so into browser history and any
 * outgoing referrer. A brand that does not exist has nowhere to post to, so
 * the block does not exist either. Ordering is a phone call or a WhatsApp
 * message, both of which are links.
 *
 * The address and opening hours are here rather than only on the about page
 * because they are what a reader looks for at the bottom of a shop's site.
 * Neither claims anything beyond itself: no founding year, no «since», no
 * count of anything.
 */
export function Footer() {
  return (
    <footer className="pattern-host plate plate--ink rounded-none">
      <Pattern id="footer" kind="tile" hue="tala" scale="md" opacity={0.25} />

      <div className="container py-[var(--band-y-tight)]">
        <div className="grid grid-cols-1 gap-[var(--band-y-tight)] md:grid-cols-12">
          {/* Brand */}
          <div className="col-start-1 row-start-1 md:col-span-5 md:col-start-1 md:row-start-1">
            <Reveal>
              <p className="t-group">{site.brand.name}</p>
              <p className="t-meta pt-1" dir="ltr">
                {site.brand.latin}
              </p>
              <p className="t-body mt-4 max-w-[28ch]">{site.brand.line}</p>
            </Reveal>
          </div>

          {/* Navigation */}
          <nav
            aria-label={ui.nav.footer}
            className="col-start-1 row-start-2 md:col-span-3 md:col-start-7 md:row-start-1"
          >
            <Reveal delay={60}>
              <h2 className="t-meta mb-3">{site.footer.navHeading}</h2>
              <ul className="flex flex-col">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="t-meta dense-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </nav>

          {/* Contact */}
          <div className="col-start-1 row-start-3 md:col-span-3 md:col-start-10 md:row-start-1">
            <Reveal delay={120}>
              <h2 className="t-meta mb-3">{site.footer.contactHeading}</h2>
              <ul className="flex flex-col">
                <li>
                  {/* `tel:` takes Latin digits with no punctuation. The visible
                      number is Persian; the href is the machine's copy, which
                      is why both live in the content file and neither is
                      derived from the other at runtime — `\d` does not match a
                      Persian digit, and a regex doing that conversion is how
                      the first site in this family shipped empty tel links. */}
                  <a href={`tel:${site.contact.phoneHref}`} className="t-meta dense-link">
                    {site.contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.contact.email}`} className="t-meta dense-link" dir="ltr">
                    {site.contact.email}
                  </a>
                </li>
                <li className="t-meta flex min-h-11 items-center">{site.contact.address}</li>
                <li className="t-meta flex min-h-11 items-center">{site.contact.hours}</li>
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Social, and the legal row when there is one */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t-2 border-[var(--color-line-reversed)] pt-6">
          <ul className="flex flex-wrap items-center gap-x-6">
            {site.social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-meta dense-link"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Rendered only when there is something to render. `legal` is empty
              on purpose: a privacy policy is the one page where plausible
              invented text is actively harmful. */}
          {site.legal.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-6">
              {site.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="t-meta dense-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="t-meta mt-10">{site.copyright}</p>
      </div>
    </footer>
  );
}
