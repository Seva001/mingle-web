import Image from "next/image";
import { compatibility } from "@/lib/marketing/landing";

/**
 * Photograph for the compatibility section ("shared ground"). Lives in its own file so the
 * section component itself stays image-free. Shows two adults sharing a laugh; it carries no
 * names, scores or numbers, so it cannot be read as a real member or a compatibility result.
 * Theme tokens only, so the label works in both themes.
 */
export function SharedGroundFigure() {
  const { figure } = compatibility;
  return (
    <figure className="mx-auto w-full max-w-md min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <Image
          src="/images/compatibility-shared-ground.jpg"
          alt="Two adults laughing together outdoors, surrounded by greenery."
          fill
          sizes="(min-width: 1024px) 28rem, (min-width: 448px) 28rem, 100vw"
          className="object-cover object-[50%_12%]"
        />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface px-3 py-1 text-caption font-semibold text-foreground shadow-card">
          {figure.overlapLabel}
        </span>
      </div>
      <figcaption className="mt-3 text-caption text-foreground/70">{figure.caption}</figcaption>
    </figure>
  );
}
