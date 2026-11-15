/**
 * Pure logic for the FAQ accordion (F2.13), kept out of the component so tests can run it
 * without a DOM. Follows the WAI-ARIA Authoring Practices accordion pattern.
 */

/** Keys that move focus between accordion headers. */
export const ACCORDION_NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"] as const;

/**
 * Index of the header that should receive focus, or null when the key isn't a navigation key.
 * Down on the last header wraps to the first and Up on the first wraps to the last.
 * `current` may be -1 (focus isn't on a header), in which case nothing moves.
 */
export function nextTriggerIndex(key: string, current: number, count: number): number | null {
  if (count <= 0 || current < 0 || current >= count) return null;
  switch (key) {
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/** A new set with `id` toggled. The input is never mutated. */
export function toggleId(open: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(open);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** A new set with `id` added (the same set is returned when it is already there). */
export function withId(open: ReadonlySet<string>, id: string): ReadonlySet<string> {
  return open.has(id) ? open : new Set(open).add(id);
}

/** Every id when expanding all, none when collapsing all. */
export function allIds(ids: readonly string[], expanded: boolean): Set<string> {
  return new Set(expanded ? ids : []);
}

/** The id a URL hash points at ("#age-who" -> "age-who"), only if it is a known item. */
export function idFromHash(hash: string, ids: readonly string[]): string | null {
  let id = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  return ids.includes(id) ? id : null;
}
