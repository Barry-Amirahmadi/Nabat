import type { Metadata, Viewport } from "next";
import { Lalezar, Rakkas, Vazirmatn } from "next/font/google";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { organizationSchema } from "@/content/schema";
import { siteRoot } from "@/lib/seo";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

/**
 * Three faces, all fetched at build time and served from this origin —
 * next/font self-hosts rather than linking to Google. That matters for a site
 * aimed at Iranian readers: no third-party font request to be slow or blocked,
 * and no layout shift while a webfont negotiates.
 *
 * Lalezar   — heavy Persian display, flat and poster-like. Band headings.
 * Rakkas    — display with Kufic-leaning verticals. Badges, group names.
 * Vazirmatn — neutral Persian sans. Everything that is read rather than seen.
 *
 * Two display faces is unusual and is the point: a maximalist page needs two
 * voices shouting at different pitches, or every heading on it is the same
 * shout. They are never mixed inside one block — `--font-display` for the
 * largest type, `--font-display-alt` for the stamped labels.
 *
 * **Both subsets on all three faces. Do not "optimise" the display faces down
 * to `arabic`.** The reasoning that suggests it is sound and wrong: nothing on
 * this site sets Latin in a display face, so the Latin file looks like dead
 * weight. But Google splits these faces by unicode range, and the `arabic`
 * subset covers `U+0600-06FF` and friends — **it does not contain `U+0020`**.
 * The space character, the em dash and the rest of general punctuation live in
 * the `latin` subset, and every Persian heading here has spaces in it. The
 * browser downloads that file either way. Dropping the subset only removes its
 * `<link rel="preload">`, turning an early parallel fetch into a late one
 * discovered after layout — the same bytes, arriving in time to cause a
 * visible swap on the largest type on the page. Measured on the fourth site in
 * this family, not reasoned about.
 *
 * Both display faces ship a single weight, so `weight` is required: next/font
 * throws at build time for a non-variable face without one. Vazirmatn is
 * variable and takes the whole axis.
 */
const lalezar = Lalezar({
  subsets: ["arabic", "latin"],
  weight: "400",
  variable: "--font-lalezar",
  display: "swap",
});

const rakkas = Rakkas({
  subsets: ["arabic", "latin"],
  weight: "400",
  variable: "--font-rakkas",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

/**
 * Site-wide defaults only. Every route composes its own title, description,
 * canonical and social card through `pageMetadata` — see `src/lib/seo.ts` for
 * why that is centralised rather than written per page.
 *
 * `metadataBase` carries the base path, unlike the bare origin the deploy
 * workflow supplies, so any relative URL Next resolves for itself lands inside
 * the deployed site rather than at the root of the host.
 *
 * **`robots` is index: false on purpose, and it agrees with `robots.ts`.**
 * This is a demonstration of a design language for a brand that does not
 * exist. Every photograph is a generated placeholder, every phone number is
 * unassigned, and the copy is written to be read by a prospective client
 * rather than found in a search for شیرینی. A template that ranks is a
 * template competing with real confectioners for their own customers.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`${siteRoot}/`),
  title: {
    default: site.seo.title,
    template: site.seo.titleTemplate,
  },
  description: site.seo.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  /* The cream the page actually opens on, so the browser chrome does not
     bracket the poster in a colour that appears nowhere in the palette. */
  themeColor: "#fff8ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${lalezar.variable} ${rakkas.variable}`}
      /* The inline script below stamps data-js before React hydrates; that is
         the point of it, so the resulting attribute difference is expected. */
      suppressHydrationWarning
    >
      <body>
        {/* Marks the document as scripted before first paint. Scroll reveals
            are hidden only under [data-js="on"], so a failed or blocked bundle
            leaves a fully readable page instead of a blank one. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-js","on")`,
          }}
        />

        <a href="#main" className="skip-link">
          {ui.skipToContent}
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />

        {/* Brand-level structured data, on every page because the organisation
            is a property of the site rather than of any one route. */}
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
