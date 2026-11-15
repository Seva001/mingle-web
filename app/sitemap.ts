import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/how-it-works",
  "/safety",
  "/community-guidelines",
  "/pricing",
  "/faq",
  "/help",
  "/contact",
  "/report",
  "/terms",
  "/privacy",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, "");
  return PUBLIC_PATHS.map((path) => ({ url: `${base}${path === "/" ? "" : path}` }));
}
