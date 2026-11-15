import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

// Public marketing pages are open to search engines. Account, member and admin areas are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/auth/",
        "/sign-in",
        "/sign-up",
        "/eligibility",
        "/forgot-password",
        "/reset-password",
        "/onboarding",
        "/discover",
        "/chats",
        "/connections",
        "/notifications",
        "/profile",
        "/settings",
        "/design-system",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
