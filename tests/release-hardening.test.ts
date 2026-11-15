import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const nextConfig = readFileSync("next.config.ts", "utf8");
const healthRoute = readFileSync("app/api/health/route.ts", "utf8");
const logger = readFileSync("lib/observability/logger.ts", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const releaseGates = readFileSync("docs/release/RELEASE_GATES.md", "utf8");
const auditScript = readFileSync("scripts/release-audit.mjs", "utf8");

describe("Batch H release hardening contract", () => {
  it("sets browser security headers and production-only HSTS", () => {
    expect(nextConfig).toContain("X-Content-Type-Options");
    expect(nextConfig).toContain("X-Frame-Options");
    expect(nextConfig).toContain("Referrer-Policy");
    expect(nextConfig).toContain("Permissions-Policy");
    expect(nextConfig).toContain("Strict-Transport-Security");
    expect(nextConfig).toContain('NEXT_PUBLIC_APP_ENV === "production"');
  });

  it("exposes only a minimal non-sensitive liveness response", () => {
    expect(healthRoute).toContain("status: 'ok'");
    expect(healthRoute).toContain("Cache-Control");
    expect(healthRoute).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("uses allowlisted structured log events and avoids arbitrary payloads", () => {
    expect(logger).toContain("SafeEventName");
    expect(logger).toContain("SAFE_CODE");
    expect(logger).toContain("SAFE_ROUTE");
    expect(logger).not.toContain("console.log(details");
  });

  it("runs dependency-backed quality gates in CI", () => {
    for (const command of ["npm ci", "npm run security:audit", "npm run typecheck", "npm run lint", "npm test", "npm run format:check", "npm run build"]) {
      expect(workflow).toContain(command);
    }
  });

  it("keeps controlled beta behind explicit owner and security gates", () => {
    expect(releaseGates).toContain("NOT CLEARED FOR STAGING OR PUBLIC BETA");
    expect(releaseGates).toContain("Owner go/no-go decision");
    expect(releaseGates).toContain("No stage automatically advances");
  });

  it("checks RLS declarations and server-role exposure", () => {
    expect(auditScript).toContain("enable\\\\s+row\\\\s+level\\\\s+security");
    expect(auditScript).toContain("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY");
  });
});
