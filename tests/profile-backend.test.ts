import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20261110000002_member_profiles.sql", "utf8");
const uploadRoute = readFileSync("app/api/profile/photos/route.ts", "utf8");
const profileServer = readFileSync("lib/profile/server.ts", "utf8");
const adminClient = readFileSync("lib/supabase/admin.ts", "utf8");
const actions = readFileSync("lib/profile/actions.ts", "utf8");

describe("Batch C persisted profile security contract", () => {
  it("keeps member profile, preferences, answers and photo records behind owner RLS", () => {
    for (const table of ["profiles", "profile_photos", "preferences", "compatibility_answers"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
    expect(migration).toContain("(select auth.uid()) = account_id");
    expect(migration).toContain("public.is_active_member()");
  });

  it("does not expose a public photo bucket or approve member uploads", () => {
    expect(migration).toContain("values ('profile-photos', 'profile-photos', false");
    expect(migration).toContain("moderation_state = 'pending'");
    expect(migration).toContain("allowed_mime_types");
    expect(uploadRoute).toContain("sharp(original");
    expect(uploadRoute).toContain(".jpeg({ quality: 82");
    expect(uploadRoute).toContain("createAdminClient");
    expect(adminClient).toContain("server-only");
    expect(adminClient).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(migration).not.toContain("create policy photos_insert_own");
    expect(migration).not.toContain("create policy profile_photo_objects_insert_own");
  });

  it("derives identity from the authenticated session and never reads DOB in profile code", () => {
    expect(profileServer).toContain('supabase.auth.getUser()');
    expect(profileServer).toContain('rpc("get_my_profile_age")');
    expect(profileServer).not.toContain("account_birth_dates");
    expect(actions).toContain('rpc("save_my_profile_step"');
  });

  it("provides no cross-member profile read policy in Batch C", () => {
    expect(migration).not.toMatch(/create policy[^;]+on public\.profiles[^;]+using\s*\(\s*true/i);
    expect(migration).toContain("Cross-member profile projection is intentionally NOT granted");
  });
});
