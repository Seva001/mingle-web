import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 30;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
// Keep in sync with the 10 MiB private bucket limit in the profile migration.
const MAX_STORED_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS = 6;

function hasValidSignature(bytes: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/webp") return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return false;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(getSiteUrl()).origin) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: "Images must be 15 MB or smaller." }, { status: 413 });
  }
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: account } = await supabase.from("accounts").select("status").eq("id", userData.user.id).maybeSingle();
  if (account?.status !== "active") return NextResponse.json({ error: "Member access is unavailable." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Images must be 15 MB or smaller." }, { status: 413 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Use a JPEG, PNG or WebP image." }, { status: 415 });

  const original = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(original, file.type)) return NextResponse.json({ error: "The image file could not be verified." }, { status: 415 });

  let normalized: Buffer;
  try {
    const image = sharp(original, { failOn: "error", limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || metadata.width > 8000 || metadata.height > 8000) {
      return NextResponse.json({ error: "Image dimensions are not supported." }, { status: 400 });
    }
    normalized = await image.rotate().resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch {
    return NextResponse.json({ error: "We couldn’t process that image. Try another photo." }, { status: 400 });
  }
  if (normalized.byteLength > MAX_STORED_PHOTO_BYTES) {
    return NextResponse.json({ error: "This image is too large after processing. Choose a smaller image." }, { status: 413 });
  }

  let admin;
  try { admin = createAdminClient(); }
  catch { return NextResponse.json({ error: "Secure photo storage is not configured yet." }, { status: 503 }); }

  const { data: existing, error: listError } = await supabase.from("profile_photos")
    .select("position").eq("account_id", userData.user.id).order("position");
  if (listError) return NextResponse.json({ error: "Photo storage is unavailable." }, { status: 503 });
  if ((existing?.length ?? 0) >= MAX_PHOTOS) return NextResponse.json({ error: "You can add up to six photos." }, { status: 409 });
  const used = new Set((existing ?? []).map((item) => item.position));
  const position = Array.from({ length: MAX_PHOTOS }, (_, index) => index).find((index) => !used.has(index));
  if (position === undefined) return NextResponse.json({ error: "You can add up to six photos." }, { status: 409 });

  const photoId = randomUUID();
  const storagePath = `${userData.user.id}/${photoId}.jpg`;
  const { error: uploadError } = await admin.storage.from("profile-photos").upload(storagePath, normalized, {
    contentType: "image/jpeg", cacheControl: "3600", upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: "We couldn’t store that photo." }, { status: 503 });

  const { error: insertError } = await admin.from("profile_photos").insert({
    id: photoId, account_id: userData.user.id, storage_path: storagePath, position, moderation_state: "pending",
  });
  if (insertError) {
    await admin.storage.from("profile-photos").remove([storagePath]);
    return NextResponse.json({ error: "We couldn’t save that photo." }, { status: 503 });
  }
  const { data: signed, error: signedError } = await supabase.storage.from("profile-photos").createSignedUrl(storagePath, 300);
  if (signedError || !signed?.signedUrl) {
    await supabase.from("profile_photos").delete().eq("id", photoId).eq("account_id", userData.user.id);
    await admin.storage.from("profile-photos").remove([storagePath]);
    return NextResponse.json({ error: "The photo was stored but could not be processed." }, { status: 503 });
  }
  return NextResponse.json({ photo: { id: photoId, storagePath, dataUrl: signed.signedUrl, moderationState: "pending" } }, { status: 201 });
}
