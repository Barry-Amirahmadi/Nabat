import Link from "next/link";
import type { GroupRun } from "@/content/groups";
import { groupAnchor } from "@/content/groups";
import { collection } from "@/content/sections";
import { toFa } from "@/lib/digits";

/**
 * The group index on the collection page.
 *
 * A standing list you consult rather than prose you read through, so it sits
 * on its own plate — and a navigation landmark, because that is what it is:
 * three links into the page. Counts are rendered from the data, so the index
 * cannot claim a number a group does not have, and a group with no published
 * items never reaches here at all.
 *
 * Every anchor points at a heading that exists on this page. An index entry
 * pointing at a removed group fails silently — the page simply does not move —
 * which is why the smoke suite resolves each href to exactly one element.
 */
export function GroupIndex({ runs, total }: { runs: GroupRun[]; total: number }) {
  return (
    <nav
      aria-label={collection.indexLabel}
      className="plate plate--shir group-index mt-[var(--band-y-tight)]"
    >
      <ul className="group-index__list">
        {runs.map((run) => (
          <li key={run.group.key}>
            <Link href={`#${groupAnchor(run.group.key)}`} className="group-index__link">
              <span>{run.group.name}</span>
              <span className="t-meta">{toFa(run.items.length)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="t-meta">
        {toFa(total)} {collection.countLabel}
      </p>
    </nav>
  );
}
