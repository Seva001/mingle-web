import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }
    return [{ source: "/(.*)", headers }];
  },
};

export default nextConfig;
