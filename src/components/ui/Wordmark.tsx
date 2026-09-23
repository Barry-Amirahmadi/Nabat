import Link from "next/link";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { cn } from "@/lib/cn";

/**
 * The brand lockup.
 *
 * The Persian name in Lalezar and nothing else — no tracked Latin
 * transliteration beside it, unlike the editorial family. Two reasons, and
 * both are about this design rather than about taste: letter-spacing is the
 * only typographic move this project forbids outright on Persian, so a tracked
 * Latin label sitting next to the name would be the one tracked thing on the
 * whole site; and Lalezar is loud enough at any size that a second, quieter
 * voice beside it reads as an apology.
 *
 * `site.brand.latin` is still content and still used — on the share card and
 * as the structured-data `alternateName`, which is where a transliteration
 * actually does a job.
 */
export function Wordmark({
  size = "sm",
  className,
  onClick,
}: {
  size?: "sm" | "lg";
  className?: string;
  /** Present so the copy inside the mobile panel can close it on the way out. */
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center rounded-[var(--radius-sm)]", className)}
      onClick={onClick}
      aria-label={`${site.brand.name} — ${ui.nav.home}`}
    >
      <span
        className="t-name"
        style={{
          fontSize: size === "lg" ? "clamp(2.25rem, 6vw, 3.5rem)" : "1.75rem",
          lineHeight: 1,
        }}
      >
        {site.brand.name}
      </span>
    </Link>
  );
}
