import Link from "next/link";
import { Info, Lock, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Card } from "@/components/ui/card";
import { trust, type TrustKey } from "@/lib/marketing/landing";

const pillarIcons: Record<TrustKey, LucideIcon> = {
  discovery: ShieldCheck,
  privacy: Lock,
  respect: Users,
};

/**
 * Landing trust and safety (F2.5). Everything is phrased as design intent, and a "Not live
 * yet" list states which safeguards do not operate today. Registration,
 * reporting and moderation are unbuilt, so none is described as available (brief §15).
 * Legal pages are drafts; no legal approval is claimed.
 */
export function TrustSafety() {
  const { adult, status } = trust;

  return (
    <Section id={trust.id} title={trust.title} intro={trust.lead} tone="strong">
      <Card className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:p-10">
        <p
          aria-hidden
          className="flex size-24 shrink-0 items-center justify-center rounded-full bg-brand font-display text-title font-semibold text-on-brand"
        >
          {adult.mark}
        </p>
        <div className="min-w-0">
          <h3 className="text-title font-semibold">{adult.title}</h3>
          <p className="mt-3 max-w-prose text-body text-foreground/70">{adult.body}</p>
        </div>
      </Card>

      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {trust.pillars.map((pillar) => {
          const Icon = pillarIcons[pillar.key];
          return (
            <li key={pillar.key} className="min-w-0">
              <Card className="h-full">
                <span className="flex size-11 items-center justify-center rounded-full bg-surface-raised">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-title font-semibold">{pillar.title}</h3>
                <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 text-foreground/70 marker:text-foreground/60">
                  {pillar.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-card border border-line bg-surface p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-body font-semibold">
          <Info className="size-4 shrink-0" aria-hidden />
          {status.title}
        </h3>
        <p className="mt-2 text-caption text-foreground/70">{status.lead}</p>
        <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {status.items.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
            >
              <dt className="font-semibold">{item.label}</dt>
              <dd className="text-caption text-foreground/70">{item.state}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-line pt-4 text-caption text-foreground/70">
          {trust.legalNote}
        </p>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
        {trust.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
