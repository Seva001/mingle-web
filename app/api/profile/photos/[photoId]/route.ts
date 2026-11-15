import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";

export async function DELETE(_request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const origin = _request.headers.get("origin");
  if (!origin || origin !== new URL(getSiteUrl()).origin) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }
  const { photoId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(photoId)) return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: photo, error: readError } = await supabase.from("profile_photos")
    .select("id, storage_path").eq("id", photoId).eq("account_id", userData.user.id).maybeSingle();
  if (readError || !photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  let admin;
  try { admin = createAdminClient(); }
  catch { return NextResponse.json({ error: "Secure photo storage is not configured yet." }, { status: 503 }); }
  const { error: storageError } = await admin.storage.from("profile-photos").remove([photo.storage_path]);
  if (storageError) return NextResponse.json({ error: "Couldn’t remove photo storage." }, { status: 503 });
  const { error: deleteError } = await admin.from("profile_photos").delete().eq("id", photo.id).eq("account_id", userData.user.id);
  if (deleteError) return NextResponse.json({ error: "Couldn’t remove photo record." }, { status: 503 });
  return new NextResponse(null, { status: 204 });
}
