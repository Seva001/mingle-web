import { Compass, MessageCircle, SlidersHorizontal, UserRound, type LucideIcon } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Card } from "@/components/ui/card";
import { values, type ExperienceKey } from "@/lib/marketing/landing";

const experienceIcons: Record<ExperienceKey, LucideIcon> = {
  profiles: UserRound,
  reasons: Compass,
  mutual: MessageCircle,
  control: SlidersHorizontal,
};

/**
 * Landing values and experience (F2.5). Core product values first, then the intended
 * experience, with a note that none of it is live. No testimonials, counts or claims about
 * outcomes (brief §15).
 */
export function Experience() {
  return (
    <Section id={values.id} title={values.title} intro={values.lead} tone="strong">
      <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {values.principles.map((principle) => (
          <li key={principle.title} className="min-w-0 border-t-2 border-brand pt-5">
            <h3 className="text-title font-semibold text-balance">{principle.title}</h3>
            <p className="mt-3 max-w-prose text-body text-foreground/70">{principle.body}</p>
          </li>
        ))}
      </ul>

      <Card className="mt-16 min-w-0 lg:p-10">
        <h3 className="font-display text-headline text-balance">{values.experienceTitle}</h3>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2">
          {values.experience.map((item) => {
            const Icon = experienceIcons[item.key];
            return (
              <li key={item.key} className="flex min-w-0 items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="mt-1.5 text-caption text-foreground/70">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 border-t border-line pt-6 text-caption text-foreground/70">
          {values.note}
        </p>
      </Card>
    </Section>
  );
}
