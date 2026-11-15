"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BasicsStep,
  IntentionsStep,
  PhotosStep,
  PreferencesStep,
  QuestionnaireStep,
  type StepProps,
} from "@/components/profile/steps";
import { Card } from "@/components/ui/card";
import { reorderMyPhotosAction, saveMyProfileStepAction } from "@/lib/profile/actions";
import type { SectionId } from "@/lib/profile/completion";
import { STEP_ORDER } from "@/lib/profile/steps";
import type { Profile, ProfilePhoto } from "@/lib/profile/types";

const TITLES: Record<SectionId, string> = {
  basics: "About you", photos: "Photos", intentions: "What you’re looking for",
  questionnaire: "Compatibility questions", preferences: "Who you’d like to meet",
};
const STEPS: Record<SectionId, (props: StepProps) => React.ReactElement> = {
  basics: BasicsStep, photos: PhotosStep, intentions: IntentionsStep,
  questionnaire: QuestionnaireStep, preferences: PreferencesStep,
};

async function persistPhotos(nextPhotos: ProfilePhoto[], previousPhotos: ProfilePhoto[]): Promise<ProfilePhoto[]> {
  const saved: ProfilePhoto[] = [];
  const newlyUploaded: ProfilePhoto[] = [];
  try {
    for (const photo of nextPhotos) {
      if (photo.storagePath) {
        saved.push(photo);
        continue;
      }
      const blob = await fetch(photo.dataUrl).then((response) => response.blob());
      const form = new FormData();
      form.append("file", new File([blob], "profile-photo.jpg", { type: blob.type || "image/jpeg" }));
      const response = await fetch("/api/profile/photos", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || !result.photo) throw new Error(result.error ?? "A photo could not be uploaded.");
      const uploaded = result.photo as ProfilePhoto;
      saved.push(uploaded);
      newlyUploaded.push(uploaded);
    }
  } catch (error) {
    await Promise.all(newlyUploaded.map((photo) => fetch(`/api/profile/photos/${photo.id}`, { method: "DELETE" })));
    throw error;
  }

  const retained = new Set(saved.map((photo) => photo.id));
  for (const oldPhoto of previousPhotos) {
    if (!retained.has(oldPhoto.id) && oldPhoto.storagePath) {
      const response = await fetch(`/api/profile/photos/${oldPhoto.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("A removed photo could not be deleted. Please try again.");
    }
  }
  const reordered = await reorderMyPhotosAction(saved.map((photo) => photo.id));
  if (!reordered.ok) throw new Error(reordered.message);
  return saved;
}

export function OnboardingFlow({ initialStep, initialProfile }: { initialStep: SectionId; initialProfile: Profile }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Profile>(initialProfile);
  const [stepId, setStepId] = useState<SectionId>(initialStep);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const index = STEP_ORDER.indexOf(stepId);
  const isLast = index === STEP_ORDER.length - 1;
  const Step = STEPS[stepId];

  function go(nextIndex: number) {
    const next = STEP_ORDER[nextIndex];
    setSaveError(null);
    if (next) {
      setStepId(next);
      window.scrollTo({ top: 0 });
    } else {
      router.push("/profile");
      router.refresh();
    }
  }

  async function handleSubmit(patch: Partial<Profile>) {
    const next = { ...current, ...patch };
    setSaving(true);
    setSaveError(null);
    try {
      if (stepId === "photos") {
        next.photos = await persistPhotos(next.photos, current.photos);
      } else {
        const result = await saveMyProfileStepAction(stepId, next);
        if (!result.ok) throw new Error(result.message);
      }
      setCurrent(next);
      go(index + 1);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "We couldn’t save this section. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-6" aria-busy={saving}>
      <div>
        <p className="text-caption font-semibold text-foreground" aria-live="polite">
          Step {index + 1} of {STEP_ORDER.length}: {TITLES[stepId]}
        </p>
        <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out" style={{ width: `${((index + 1) / STEP_ORDER.length) * 100}%` }} />
        </div>
      </div>
      <Card>
        <Step key={stepId} profile={current} onSubmit={handleSubmit}
          onBack={index > 0 ? () => go(index - 1) : undefined}
          onSkip={stepId === "questionnaire" ? () => go(index + 1) : undefined}
          isLast={isLast} isSaving={saving} saveError={saving ? "Saving securely…" : saveError} />
      </Card>
    </div>
  );
}
