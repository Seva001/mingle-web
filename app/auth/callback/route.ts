import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const rawNext = request.nextUrl.searchParams.get("next") || "/discover";
  const siteUrl = getSiteUrl();
  let next = new URL("/discover", siteUrl);
  try {
    const requestedDestination = new URL(rawNext, siteUrl);
    if (requestedDestination.origin === new URL(siteUrl).origin) {
      next = requestedDestination;
    }
  } catch {
    // Ignore malformed or external return destinations and use the safe local default.
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(next);
  }
  return NextResponse.redirect(new URL("/sign-in?error=confirmation", siteUrl));
}
