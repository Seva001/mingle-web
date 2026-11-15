"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { useState } from "react";
import { ProfileCard } from "@/components/profile/profile-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { setMyProfileVisibilityAction } from "@/lib/profile/actions";
import { profileCompletion } from "@/lib/profile/completion";
import type { Profile } from "@/lib/profile/types";

export function ProfileOverview({ initialProfile }: { initialProfile: Profile }) {
  const [current, setCurrent] = useState(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const completion = profileCompletion(current);
  const started = completion.percent > 0 || current.displayName.trim() !== "";

  async function setVisibility(visible: boolean) {
    setSaving(true);
    setError(null);
    const result = await setMyProfileVisibilityAction(visible);
    if (result.ok) setCurrent((previous) => ({ ...previous, visibility: visible ? "visible" : "hidden" }));
    else setError(result.message);
    setSaving(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <ProfileCard profile={current} />
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-title font-semibold">Profile completion</h2>
            <p className="text-body font-semibold">{completion.percent}%</p>
          </div>
          <div role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion.percent}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out" style={{ width: `${completion.percent}%` }} />
          </div>
          <ul className="mt-5 flex flex-col divide-y divide-line">
            {completion.sections.map((section) => (
              <li key={section.id} className="flex items-center justify-between gap-4 py-3">
                <span className="flex items-center gap-3">
                  {section.complete ? <Check className="size-5 shrink-0" aria-hidden /> : <Circle className="size-5 shrink-0 text-muted" aria-hidden />}
                  <span><span className="block font-semibold">{section.label}</span>
                    <span className="block text-caption text-muted">{section.complete ? "Complete" : (section.detail ?? "Needs attention")}{section.required ? "" : " · optional"}</span>
                  </span>
                </span>
                <Link href={`/onboarding?step=${section.id}`} aria-label={`${section.complete ? "Edit" : "Complete"} ${section.label}`} className="rounded-control px-3 py-2 text-caption font-semibold underline">
                  {section.complete ? "Edit" : "Complete"}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href={`/onboarding?step=${completion.nextSection ?? "basics"}`} className="mt-5" variant={started ? "secondary" : "primary"}>
            {started ? "Continue editing" : "Set up your profile"}
          </ButtonLink>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-title font-semibold">Show my profile in discovery</h2>
              <p className="mt-1 text-caption text-muted">Turn this off to pause being suggested to others. You can still browse.</p>
            </div>
            <Switch checked={current.visibility === "visible"} onCheckedChange={setVisibility} label="Show my profile in discovery" disabled={saving} />
          </div>
          {error ? <p role="alert" className="mt-3 text-caption font-medium text-danger">{error}</p> : null}
        </Card>
        <p className="text-caption text-muted">Your profile details and photos are stored securely. New photos stay private while pending review; only approved photos can appear in discovery.</p>
      </div>
    </div>
  );
}
