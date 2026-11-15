"use server";

import { createClient } from "@/lib/supabase/server";

const allowedCategories = new Set([
  "harassment",
  "hate_or_discrimination",
  "threats",
  "impersonation",
  "inappropriate_content",
  "spam_or_scam",
  "safety_concern",
  "other",
]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SafetyReportInput = {
  category: string;
  details: string;
  targetAccountId?: string;
};

export async function submitSafetyReport(input: SafetyReportInput): Promise<{ ok: boolean; message: string }> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Choose a report category and provide 20–2,000 characters describing the concern." };
  }

  const raw = input as unknown as Record<string, unknown>;
  if (typeof raw.category !== "string" || typeof raw.details !== "string"
    || (raw.targetAccountId !== undefined && raw.targetAccountId !== null && typeof raw.targetAccountId !== "string")) {
    return { ok: false, message: "Choose a report category and provide 20–2,000 characters describing the concern." };
  }

  const category = raw.category.trim();
  const details = raw.details.trim();
  const targetAccountId = typeof raw.targetAccountId === "string" ? raw.targetAccountId.trim() || null : null;
  if (!allowedCategories.has(category) || details.length < 20 || details.length > 2000) {
    return { ok: false, message: "Choose a report category and provide 20–2,000 characters describing the concern." };
  }
  if (targetAccountId && !uuidPattern.test(targetAccountId)) {
    return { ok: false, message: "The member reference must be a valid profile reference, or leave it blank." };
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { ok: false, message: "Sign in to your MINGLE account before submitting a report." };
    }
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("status")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (accountError || account?.status !== "active") {
      return { ok: false, message: "Your account must be active to submit a report. If you need urgent help, contact local emergency services." };
    }
    const { error } = await supabase.rpc("submit_safety_report", {
      target_account_id: targetAccountId,
      report_category: category,
      report_details: details,
    });
    if (error) {
      if (error.code === "42900") return { ok: false, message: "You have reached the report limit for the last 24 hours. If there is immediate danger, contact local emergency services." };
      return { ok: false, message: "We could not submit this report. Please check the details and try again." };
    }
    return { ok: true, message: "Your report has been submitted securely. Our safety team can review it." };
  } catch {
    return { ok: false, message: "Reporting is temporarily unavailable. If someone is in immediate danger, contact local emergency services." };
  }
}
