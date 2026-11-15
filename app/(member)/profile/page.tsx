import type { Metadata } from "next";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { getMyProfile } from "@/lib/profile/server";
import { emptyProfile } from "@/lib/profile/types";

export const metadata: Metadata = { title: "Your profile" };

export default async function Page() {
  const profile = (await getMyProfile()) ?? emptyProfile();
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-headline">Your profile</h1>
      <ProfileOverview initialProfile={profile} />
    </div>
  );
}
