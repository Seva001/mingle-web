import Image from "next/image";

/**
 * Homepage hero photograph. Decorative-with-meaning: the alt text describes the scene, and the
 * image carries no names, scores, counts or UI overlays, so it cannot be read as a real member
 * profile or a match result (brief §15).
 */
export function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-card">
        <Image
          src="/images/hero-phone.jpg"
          alt="A smiling woman with curly hair looks down at her phone while standing on a sunlit city street."
          fill
          priority
          sizes="(min-width: 1024px) 28rem, (min-width: 448px) 28rem, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <figcaption className="mt-3 text-center text-caption text-foreground/70">
        Shared moments, meaningful connections.
      </figcaption>
    </figure>
  );
}
