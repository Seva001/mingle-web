import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20261110000004_safety_admin.sql", "utf8");
const reportAction = readFileSync("lib/safety/actions.ts", "utf8");
const adminActions = readFileSync("lib/admin/actions.ts", "utf8");
const adminServer = readFileSync("lib/admin/server.ts", "utf8");
const reportForm = readFileSync("components/safety/report-form.tsx", "utf8");

describe("Batch E safety and administration security contract", () => {
  it("keeps staff roles, reports and audit events inaccessible through direct member table access", () => {
    for (const table of ["admin_memberships", "safety_reports", "moderation_audit_events"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`revoke all on public.${table} from anon, authenticated`);
    }
    expect(migration).toContain("grant all on public.admin_memberships to service_role");
  });

  it("derives report identity from auth.uid and enforces validation and a daily submission cap", () => {
    expect(migration).toContain("reporter_id uuid := auth.uid()");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).toContain(">= 5");
    expect(migration).toContain("char_length(trim(coalesce(report_details, ''))) not between 20 and 2000");
    expect(reportAction).toContain('supabase.rpc("submit_safety_report"');
  });

  it("checks staff roles inside privileged RPCs and records moderation decisions", () => {
    expect(migration).toContain("public.has_admin_role(array['admin', 'moderator'])");
    expect(migration).toContain("public.has_admin_role(array['admin'])");
    expect(migration).toContain("insert into public.moderation_audit_events");
    expect(migration).toContain("admin_review_profile_photo");
    expect(migration).toContain("admin_update_report");
    expect(migration).toContain("admin_suspend_member");
    expect(adminActions).toContain('rpc("admin_review_profile_photo"');
    expect(adminActions).toContain('rpc("admin_update_report"');
  });

  it("signs private moderation photos on the server and hides the admin route from unauthorized users", () => {
    expect(adminServer).toContain("createAdminClient");
    expect(adminServer).toContain("createSignedUrl");
    expect(adminServer).toContain('rpc("has_admin_role"');
    expect(reportForm).toContain("submitSafetyReport");
  });
});
