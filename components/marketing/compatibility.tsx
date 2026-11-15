import { Info } from "lucide-react";
import { SharedGroundFigure } from "@/components/marketing/shared-ground-figure";
import { Section } from "@/components/marketing/section";
import { Card } from "@/components/ui/card";
import { compatibility } from "@/lib/marketing/landing";

/**
 * Landing compatibility explanation (F2.5). Plain language, no percentages or scores, no
 * sensitive traits, and an explicit "guidance, not a guarantee" statement (brief §6, §15).
 * Signals mirror lib/compatibility/weights.ts by name only; weights are never shown.
 */
export function Compatibility() {
  return (
    <Section
      id={compatibility.id}
      title={compatibility.title}
      intro={compatibility.lead}
      tone="strong"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div className="min-w-0">
          <ol className="grid gap-8 sm:grid-cols-3">
            {compatibility.how.map((item, index) => (
              <li key={item.title} className="min-w-0">
                <p className="text-caption font-semibold text-foreground/70">Part {index + 1}</p>
                <h3 className="mt-1 text-body font-semibold">{item.title}</h3>
                <p className="mt-2 text-caption text-foreground/70">{item.body}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-title font-semibold">{compatibility.signalsTitle}</h3>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {compatibility.signals.map((signal) => (
              <div
                key={signal.label}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <dt className="font-semibold sm:w-56 sm:shrink-0">{signal.label}</dt>
                <dd className="text-foreground/70">{signal.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <SharedGroundFigure />
          <Card className="min-w-0">
            <p className="flex items-center gap-2 text-body font-semibold">
              <Info className="size-4 shrink-0" aria-hidden />
              {compatibility.disclaimerTitle}
            </p>
            <p className="mt-3 text-caption text-foreground/70">{compatibility.disclaimer}</p>
            <p className="mt-3 text-caption text-foreground/70">{compatibility.excluded}</p>
          </Card>
        </div>
      </div>
    </Section>
  );
}
