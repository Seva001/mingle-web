"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Administrator sign-in required.");
  return supabase;
}

export async function reviewProfilePhoto(input: { photoId: string; decision: "approved" | "rejected"; note?: string }) {
  try {
    const supabase = await adminClient();
    const { error } = await supabase.rpc("admin_review_profile_photo", {
      photo_id: input.photoId,
      decision: input.decision,
      moderator_note: input.note?.slice(0, 500) || null,
    });
    if (error) return { ok: false, message: "The photo review could not be saved. Your permissions or the queue may have changed." };
    revalidatePath("/admin");
    return { ok: true, message: `Photo ${input.decision}.` };
  } catch {
    return { ok: false, message: "Administrator sign-in is required." };
  }
}

export async function updateSafetyReport(input: { reportId: string; status: "under_review" | "resolved" | "dismissed"; resolution?: string }) {
  try {
    const supabase = await adminClient();
    const { error } = await supabase.rpc("admin_update_report", {
      report_id: input.reportId,
      new_status: input.status,
      resolution: input.resolution?.slice(0, 1000) || null,
    });
    if (error) return { ok: false, message: "The report update could not be saved. Check your staff role and try again." };
    revalidatePath("/admin");
    return { ok: true, message: `Report moved to ${input.status.replaceAll("_", " ")}.` };
  } catch {
    return { ok: false, message: "Administrator sign-in is required." };
  }
}

export async function suspendMember(input: { accountId: string; reason: string }) {
  try {
    const supabase = await adminClient();
    const { error } = await supabase.rpc("admin_suspend_member", {
      target_account_id: input.accountId,
      reason: input.reason.slice(0, 500),
    });
    if (error) return { ok: false, message: "The account could not be suspended. An administrator role and a valid reason are required." };
    revalidatePath("/admin");
    return { ok: true, message: "Account suspended and active connections revoked." };
  } catch {
    return { ok: false, message: "Administrator sign-in is required." };
  }
}
