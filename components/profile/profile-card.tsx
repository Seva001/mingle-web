import { MapPin } from "lucide-react";
import { INTENTIONS } from "@/lib/profile/options";
import type { Profile } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

/**
 * Photo-led profile card (brief §11). Reused by Discovery in Phase 4. Text sits on a dark scrim
 * in both themes so it stays legible over any photo.
 */
export function ProfileCard({
  profile,
  className,
}: {
  profile: Pick<Profile, "displayName" | "age" | "city" | "photos" | "intention" | "interests">;
  className?: string;
}) {
  const photo = profile.photos[0];
  const name = profile.displayName.trim() || "Your name";
  const intention = INTENTIONS.find((i) => i.value === profile.intention)?.label;

  return (
    <article
      aria-label={`Profile: ${name}`}
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-card border border-line shadow-card",
        className,
      )}
      style={{ background: "linear-gradient(160deg, #2b2040 0%, #5a2f3a 55%, #8a4a30 100%)" }}
    >
      {photo ? (
        <>
          {/* Data URL from the member's own device: next/image has nothing to optimise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.dataUrl} alt="" className="absolute inset-0 size-full object-cover" />
        </>
      ) : (
        <span
          aria-hidden
          className="font-display absolute inset-0 flex items-center justify-center text-[7rem] text-white/30"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div aria-hidden className="absolute inset-0" style={{ background: "var(--photo-scrim)" }} />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
        <div>
          <h3 className="font-display text-title">
            {name}
            {profile.age !== null ? `, ${profile.age}` : ""}
          </h3>
          {profile.city ? (
            <p className="mt-1 flex items-center gap-1.5 text-caption text-white/80">
              <MapPin className="size-3.5" aria-hidden />
              {profile.city}
            </p>
          ) : null}
        </div>
        {intention ? (
          <p className="glass-photo w-fit rounded-full px-3 py-1.5 text-caption font-medium">
            Looking for: {intention.toLowerCase()}
          </p>
        ) : null}
        {profile.interests.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 4).map((interest) => (
              <li
                key={interest}
                className="glass-photo rounded-full px-3 py-1 text-caption font-medium"
              >
                {interest}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
