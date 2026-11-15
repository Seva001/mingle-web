"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getActiveClient() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Please sign in to continue.");
  const { data: account, error } = await supabase.from("accounts").select("status").eq("id", user.id).maybeSingle();
  if (error || account?.status !== "active") throw new Error("Your account is not currently eligible to use Mingle.");
  return supabase;
}

function validTarget(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("That profile could not be found.");
  }
}

export async function likeMemberAction(targetId: string) {
  validTarget(targetId);
  const supabase = await getActiveClient();
  const { data, error } = await supabase.rpc("like_member", { target_account_id: targetId });
  if (error) throw new Error(error.message.includes("no longer eligible") ? "This profile is no longer available." : "Your interest could not be sent. Please try again.");
  revalidatePath("/discover"); revalidatePath("/connections");
  const result = data?.[0];
  return { liked: Boolean(result?.liked), matched: Boolean(result?.matched), connectionId: result?.connection_id ?? null };
}

export async function passMemberAction(targetId: string) {
  validTarget(targetId);
  const supabase = await getActiveClient();
  const { error } = await supabase.rpc("pass_member", { target_account_id: targetId });
  if (error) throw new Error("This profile could not be passed. Please try again.");
  revalidatePath("/discover");
  return { success: true };
}

export async function toggleSavedProfileAction(targetId: string, shouldSave: boolean) {
  validTarget(targetId);
  const supabase = await getActiveClient();
  const { error } = await supabase.rpc("toggle_saved_profile", { target_account_id: targetId, should_save: shouldSave });
  if (error) throw new Error("Your saved profiles could not be updated.");
  revalidatePath("/discover");
  return { success: true };
}

export async function blockMemberAction(targetId: string) {
  validTarget(targetId);
  const supabase = await getActiveClient();
  const { error } = await supabase.rpc("block_member", { target_account_id: targetId });
  if (error) throw new Error("This profile could not be blocked. Please try again.");
  revalidatePath("/discover"); revalidatePath("/connections"); revalidatePath("/chats");
  return { success: true };
}
