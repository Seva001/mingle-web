import {
  Check,
  Compass,
  HeartHandshake,
  MessageCircle,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Card } from "@/components/ui/card";
import { introduction, type PillarKey } from "@/lib/marketing/introduction";

const pillarIcons: Record<PillarKey, LucideIcon> = {
  values: HeartHandshake,
  lifestyle: SlidersHorizontal,
  discovery: Compass,
  connection: MessageCircle,
};

/**
 * Landing introduction (F2.4): what Mingle is, the problem, why compatibility matters and how
 * discovery differs from swipe-first apps. Static server component with no client state.
 * Contains no member counts, testimonials, profiles or guarantees (brief §15).
 */
export function Introduction() {
  const { comparison } = introduction;

  return (
    <Section
      id={introduction.id}
      eyebrow={introduction.eyebrow}
      title={introduction.title}
      intro={introduction.lead}
      tone="strong"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-10">
          {introduction.blocks.map((block) => (
            <div key={block.title}>
              <h3 className="text-title font-semibold">{block.title}</h3>
              <p className="mt-3 max-w-prose text-body text-foreground/70">{block.body}</p>
            </div>
          ))}
        </div>

        <Card className="min-w-0 lg:p-8">
          <h3 className="text-title font-semibold">{comparison.title}</h3>
          <dl className="mt-6 divide-y divide-line">
            {comparison.rows.map((row) => (
              <div key={row.aspect} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
                <dt className="text-caption font-semibold text-foreground/70">{row.aspect}</dt>
                <dd className="flex items-start gap-3 text-body text-foreground/70">
                  <span
                    aria-hidden
                    className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-foreground/40"
                  />
                  <span>
                    <span className="font-semibold">{comparison.swipeLabel}: </span>
                    {row.swipe}
                  </span>
                </dd>
                <dd className="flex items-start gap-3 text-body text-foreground">
                  <span
                    aria-hidden
                    className="mt-[0.2rem] flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand"
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span>
                    <span className="font-semibold">{comparison.mingleLabel}: </span>
                    {row.mingle}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-caption text-foreground/70">{comparison.note}</p>
        </Card>
      </div>

      <ul className="mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {introduction.pillars.map((pillar) => {
          const Icon = pillarIcons[pillar.key];
          return (
            <li key={pillar.key} className="min-w-0">
              <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-body font-semibold">{pillar.title}</h3>
              <p className="mt-1.5 text-caption text-foreground/70">{pillar.body}</p>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 max-w-3xl text-caption text-foreground/70">{introduction.note}</p>
    </Section>
  );
}
