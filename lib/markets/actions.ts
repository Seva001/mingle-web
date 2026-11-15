"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MarketSettingsActionState = { status: "idle" | "success" | "error"; message?: string };

export async function updateMyMarketSettingsAction(
  _previous: MarketSettingsActionState,
  formData: FormData,
): Promise<MarketSettingsActionState> {
  const locale = String(formData.get("locale") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(locale) || timezone.length < 1 || timezone.length > 80) {
    return { status: "error", message: "Enter a supported language and a valid timezone." };
  }
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { status: "error", message: "Please sign in again." };
    const { error } = await supabase.rpc("update_my_locale_settings", { p_locale: locale, p_timezone: timezone });
    if (error) return { status: "error", message: "That language or timezone is not enabled for your launch market." };
    revalidatePath("/settings");
    return { status: "success", message: "Your language and timezone settings have been saved." };
  } catch {
    return { status: "error", message: "Settings are unavailable right now. Please try again." };
  }
}
