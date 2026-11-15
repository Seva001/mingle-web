"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  allIds,
  idFromHash,
  nextTriggerIndex,
  toggleId,
  withId,
} from "@/lib/marketing/accordion";
import type { FaqCategory } from "@/lib/marketing/support";

type FaqAccordionProps = {
  categories: readonly FaqCategory[];
  controls: { expand: string; collapse: string };
};

/**
 * FAQ accordion (F2.13), following the WAI-ARIA accordion pattern.
 *
 * - Each question is a real <button> inside a heading, so it is focusable and Enter and Space
 *   toggle it natively.
 * - The button carries aria-expanded and aria-controls; the answer is `hidden` while closed, so
 *   it leaves both the visual layout and the accessibility tree.
 * - Up, Down, Home and End move focus between questions (Down on the last wraps to the first).
 * - Several answers can be open at once; "Expand all" and "Collapse all" are ordinary buttons.
 * - A URL hash that names a question (/faq#age-who) opens it.
 * - Focus uses the global :focus-visible ring, drawn inside the row so no parent can clip it.
 * - State is never carried by colour alone: the chevron flips and aria-expanded is announced.
 * - No transitions or motion, so reduced-motion needs no special case.
 *
 * The answer panels deliberately have no role="region": with this many panels it would add a
 * landmark per question, which the APG advises against.
 */
export function FaqAccordion({ categories, controls }: FaqAccordionProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => categories.flatMap((c) => c.items.map((item) => item.id)), [categories]);

  useEffect(() => {
    const openFromHash = () => {
      const id = idFromHash(window.location.hash, ids);
      if (!id) return;
      setOpen((current) => withId(current, id));
      // The panel changes the page height, so bring the question back into view once it has.
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    };
    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [ids]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (!target.hasAttribute("data-faq-trigger")) return;
    const triggers = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]") ?? [],
    );
    const next = nextTriggerIndex(event.key, triggers.indexOf(target as HTMLButtonElement), triggers.length);
    if (next === null) return;
    event.preventDefault();
    triggers[next]?.focus();
  }

  return (
    <div ref={rootRef} onKeyDown={onKeyDown}>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" variant="secondary" onClick={() => setOpen(allIds(ids, true))}>
          {controls.expand}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(allIds(ids, false))}>
          {controls.collapse}
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-14">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-title`}
            className="scroll-mt-20"
          >
            <h2 id={`${category.id}-title`} className="font-display text-headline">
              {category.title}
            </h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {category.items.map((item) => {
                const isOpen = open.has(item.id);
                const panelId = `${item.id}-panel`;
                return (
                  <li key={item.id}>
                    <h3 id={item.id} className="scroll-mt-20">
                      <button
                        type="button"
                        data-faq-trigger=""
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen((current) => toggleId(current, item.id))}
                        className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-body font-semibold hover:bg-foreground/5 focus-visible:-outline-offset-2"
                      >
                        <span className="min-w-0">{item.question}</span>
                        <ChevronDown
                          aria-hidden
                          className={isOpen ? "size-5 shrink-0 rotate-180" : "size-5 shrink-0"}
                        />
                      </button>
                    </h3>
                    <div id={panelId} hidden={!isOpen} className="pb-6">
                      <div className="flex max-w-prose flex-col gap-3 text-body text-foreground/70">
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
