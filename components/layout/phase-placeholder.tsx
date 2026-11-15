import { Card } from "@/components/ui/card";

type PhasePlaceholderProps = {
  title: string;
  phase?: number;
  phaseName?: string;
  /** Overrides the default status line (e.g. legal pages awaiting review). */
  status?: string;
  /** One line: what the member will be able to do here. */
  summary: string;
};

/**
 * Honest stand-in for screens that are not built yet (brief §15: no placeholder flows
 * represented as production features). Remove each one as its phase ships.
 */
export function PhasePlaceholder({
  title,
  phase,
  phaseName,
  summary,
  status,
}: PhasePlaceholderProps) {
  return (
    <Card className="max-w-xl">
      <h1 className="font-display text-headline">{title}</h1>
      <p className="mt-3 text-lead text-muted">{summary}</p>
      <p className="mt-6 text-caption text-muted">
        {status ?? `Not built yet. Planned for phase ${phase} (${phaseName}).`}
      </p>
    </Card>
  );
}
