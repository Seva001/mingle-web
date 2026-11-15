import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20261110000003_discovery_connections.sql"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "lib/discovery/actions.ts"), "utf8");
const server = readFileSync(resolve(process.cwd(), "lib/discovery/server.ts"), "utf8");

describe("Batch D discovery and connection backend contract", () => {
  it("keeps cross-member profile reads behind a narrow authenticated projection", () => {
    expect(migration).toContain("create function public.get_discovery_candidates");
    expect(migration).toContain("p.profile_status = 'complete' and p.visibility = 'visible'");
    expect(migration).toContain("mine.age_min and mine.age_max");
    expect(migration).toContain("theirs.age_min and theirs.age_max");
    expect(migration).toContain("ph.moderation_state = 'approved'");
    expect(migration).not.toMatch(/grant\s+select\s+on\s+public\.profiles\s+to\s+authenticated/i);
    expect(migration).not.toContain("'date_of_birth'");
    expect(migration).not.toContain("'answers', coalesce");
  });

  it("creates a connection only after reciprocal likes", () => {
    expect(migration).toContain("create function public.like_member");
    expect(migration).toContain("where actor_id = target_account_id and target_id = member_id");
    expect(migration).toContain("on conflict (member_one, member_two) do nothing");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("create function public.pass_member");
    expect(migration).toContain("create function public.toggle_saved_profile");
    expect(migration).toContain("create function public.block_member");
  });

  it("keeps action identity server-derived and uses authenticated RPCs", () => {
    expect(actions).toContain("supabase.auth.getUser()");
    expect(actions).toContain("supabase.rpc(\"like_member\"");
    expect(actions).toContain("supabase.rpc(\"pass_member\"");
    expect(actions).toContain("supabase.rpc(\"toggle_saved_profile\"");
    expect(actions).toContain("supabase.rpc(\"block_member\"");
    expect(server).toContain("createAdminClient()");
    expect(server).toContain("createSignedUrl(photo.storage_path, 300)");
  });
});
