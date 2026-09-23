import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PlateHue } from "@/components/layout/Band";

/**
 * A sticker badge: a small plate, a hard drop shadow, a fixed angle.
 *
 * Three of these sit on the poster. The angles are tokens, not random values —
 * a layout that comes out different on the next build cannot be reviewed, and
 * the verification pass measures each one's bounding box against the viewport,
 * which is only meaningful if the angle is the same twice.
 *
 * Set in Rakkas, the second display face, and therefore never on the same line
 * as anything set in Lalezar.
 */

/** Only the plates whose ratio allows short display text. All three are in
 *  the measured table: saffron ink 8.81:1, pomegranate cream 4.64:1,
 *  pistachio cream 5.29:1. */
export type StickerHue = Extract<PlateHue, "zafaran" | "anar" | "pesteh" | "golab" | "lajvard">;

const PLATES: Record<StickerHue, string> = {
  zafaran: "plate plate--zafaran",
  anar: "plate plate--anar",
  pesteh: "plate plate--pesteh",
  golab: "plate plate--golab",
  lajvard: "plate plate--lajvard",
};

/** The three fixed badge angles, as token names. */
const TILTS = ["var(--tilt-badge-1)", "var(--tilt-badge-2)", "var(--tilt-badge-3)"] as const;

export function Sticker({
  children,
  hue,
  /** 0, 1 or 2 — which of the three fixed angles this badge takes. */
  index = 0,
  className,
}: {
  children: ReactNode;
  hue: StickerHue;
  index?: 0 | 1 | 2;
  className?: string;
}) {
  return (
    <span
      className={cn("badge tilt", PLATES[hue], className)}
      style={{ "--tilt": TILTS[index] } as CSSProperties}
    >
      <span className="t-badge">{children}</span>
    </span>
  );
}
