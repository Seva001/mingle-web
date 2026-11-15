"use client";

import { ImagePlus } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { MAX_PHOTOS } from "@/lib/profile/options";
import { processPhoto } from "@/lib/profile/photo";
import type { ProfilePhoto } from "@/lib/profile/types";

type PhotoManagerProps = {
  photos: ProfilePhoto[];
  onChange: (next: ProfilePhoto[]) => void;
  error?: string;
};

export function PhotoManager({ photos, onChange, error }: PhotoManagerProps) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const full = photos.length >= MAX_PHOTOS;

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setNotice(null);
    const added: ProfilePhoto[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      if (photos.length + added.length >= MAX_PHOTOS) {
        problems.push(`Only ${MAX_PHOTOS} photos fit. Extra photos were skipped.`);
        break;
      }
      const result = await processPhoto(file);
      if (result.ok) added.push(result.photo);
      else problems.push(`${file.name}: ${result.error}`);
    }
    if (added.length > 0) onChange([...photos, ...added]);
    setNotice(problems.length > 0 ? problems.join(" ") : null);
    setBusy(false);
  }

  const makeMain = (index: number) => {
    const next = [...photos];
    const [chosen] = next.splice(index, 1);
    if (chosen) onChange([chosen, ...next]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-caption font-semibold text-foreground">Your photos</p>
        <p className="mt-1 text-caption text-muted">
          Add 1 to {MAX_PHOTOS}. The first photo is your main one. Photos are resized and stripped of location data before upload. Uploaded photos are stored privately and remain unavailable to other members until moderation.
        </p>
      </div>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="flex flex-col gap-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-control border border-line bg-surface-raised">
                {/* Data URL from the member's own device: next/image has nothing to optimise. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt={index === 0 ? "Your main photo" : `Your photo ${index + 1}`}
                  className="size-full object-cover"
                />
                {index === 0 ? (
                  <span className="glass-photo absolute top-2 left-2 rounded-full px-2.5 py-1 text-caption font-medium">
                    Main
                  </span>
                ) : null}
                {photo.moderationState ? (
                  <span className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-caption font-semibold ${photo.moderationState === "approved" ? "bg-emerald-700 text-white" : photo.moderationState === "rejected" ? "bg-danger text-white" : "bg-black/70 text-white"}`}>
                    {photo.moderationState === "pending" ? "In review" : photo.moderationState === "approved" ? "Approved" : "Rejected"}
                  </span>
                ) : null}
              </div>
              {photo.moderationState === "rejected" ? <p className="text-caption font-medium text-danger">This photo was not approved. Remove it and upload a different photo.</p> : null}
              <div className="flex flex-wrap gap-2">
                {index > 0 ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => makeMain(index)}
                    aria-label={`Make photo ${index + 1} your main photo`}
                  >
                    Make main
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || full}
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          aria-disabled={busy || full}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-control border border-line bg-surface px-5 text-body font-semibold hover:bg-surface-raised peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          <ImagePlus className="size-4" aria-hidden />
          {busy ? "Adding…" : full ? "Photo limit reached" : "Add photos"}
        </label>
      </div>

      <div aria-live="polite" className="flex flex-col gap-1">
        {notice ? <p className="text-caption font-medium text-danger">{notice}</p> : null}
        {error ? <p className="text-caption font-medium text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
