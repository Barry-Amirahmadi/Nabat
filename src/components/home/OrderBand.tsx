import { site } from "@/content/site";
import { inquiry, order } from "@/content/sections";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Band } from "@/components/layout/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home band 5 — the order band, and the whole of this site's conversion.
 *
 * There is no cart, no price and no form. A form needs a backend to post to,
 * and one that posts nowhere falls back to a GET at the current URL: the page
 * reloads, the scroll position is lost, and whatever the visitor typed goes
 * into the URL and therefore into history and any outgoing referrer. The
 * template this engine came from shipped exactly that and a test now forbids
 * it. What exists instead is a phone number and a WhatsApp link, which work on
 * a static host with nothing behind them.
 *
 * Four dense blocks on four different plates, on the darkest ground on the
 * site. Every plate here carries its text at a measured ratio: ink on saffron
 * 8.81:1, cream on pistachio 5.29:1, cream on pomegranate 4.64:1, ink on
 * cream 16.92:1.
 *
 * `id="order"` is the target of «سفارش» in the header and in the mobile panel.
 * This band closes every route — the homepage, the collection, each item, the
 * gallery and the about page — because the conversion is a phone call and a
 * reader who has reached the bottom of any page should not have to navigate to
 * find the number. One instance per document, so the id stays unique.
 *
 * The nav href is still written as `/#order` rather than as a bare `#order`.
 * A bare fragment would resolve against whichever page the header happens to
 * be rendered on, and `next/link` applies the deployment base path only to a
 * root-relative href — so the root-relative form is the only one that survives
 * a GitHub Pages project subpath. From another page it navigates home and then
 * scrolls, which is correct: «سفارش» in the navigation means the homepage's
 * order band, not "the bottom of whatever you are reading".
 */

interface Block {
  label: string;
  value: string;
  plate: string;
  /** Rendered as a link when the value is dialable or messageable. */
  href?: string;
  external?: boolean;
  place: string;
}

export function OrderBand() {
  /* No `fillTemplate` here: the general greeting carries no `{product}`
     token, and running a substitution over a string with nothing to
     substitute is the kind of call that later looks like it means something. */
  const chat = whatsappLink(site.contact.whatsapp, inquiry.generalMessage);

  /* Explicit row and column on all four, at both breakpoints. */
  const blocks: Block[] = [
    {
      label: order.labels.phone,
      value: site.contact.phone,
      plate: "plate plate--zafaran",
      href: `tel:${site.contact.phoneHref}`,
      place: "row-start-1 col-start-1 md:row-start-1 md:col-start-1",
    },
    {
      label: order.labels.whatsapp,
      value: inquiry.generalLabel,
      plate: "plate plate--pesteh",
      href: chat,
      external: true,
      place: "row-start-2 col-start-1 md:row-start-1 md:col-start-2",
    },
    {
      label: order.labels.hours,
      value: site.contact.hours,
      plate: "plate plate--anar",
      place: "row-start-3 col-start-1 md:row-start-2 md:col-start-1",
    },
    {
      label: order.labels.address,
      value: site.contact.address,
      plate: "plate plate--shir",
      place: "row-start-4 col-start-1 md:row-start-2 md:col-start-2",
    },
  ];

  return (
    <Band
      id="order"
      plate="ink"
      pattern={{ id: "order", kind: "tile", hue: "tala", scale: "md", opacity: 0.35 }}
      aria-labelledby="order-heading"
    >
      <div className="grid grid-cols-1 gap-[var(--band-y-tight)] lg:grid-cols-12">
        <div className="col-start-1 row-start-1 flex flex-col items-start gap-5 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <Eyebrow>{order.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={70}>
            <h2 id="order-heading" className="t-band max-w-[18ch]">
              {order.heading}
            </h2>
          </Reveal>
          <Reveal delay={140} className="plate-own max-w-[var(--measure)] p-4">
            <p className="t-lead">{order.lead}</p>
          </Reveal>
          <Reveal delay={210}>
            <Button href={chat} external>
              {inquiry.generalLabel}
            </Button>
          </Reveal>
        </div>

        <ul className="col-start-1 row-start-2 grid grid-cols-1 gap-[var(--grid-gap)] md:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:row-start-1">
          {blocks.map((block) => (
            <li key={block.label} className={block.place}>
              <div className={cn("order-block", block.plate)}>
                <p className="t-meta">{block.label}</p>
                {block.href ? (
                  <a
                    href={block.href}
                    className="order-block__value dense-link"
                    {...(block.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {block.value}
                    {block.external ? (
                      <span className="sr-only"> — {inquiry.newWindow}</span>
                    ) : null}
                  </a>
                ) : (
                  <p className="order-block__value">{block.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
