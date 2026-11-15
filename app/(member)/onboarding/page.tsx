import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/profile/onboarding-flow";
import { parseStep } from "@/lib/profile/steps";
import { getMyProfile } from "@/lib/profile/server";
import { emptyProfile } from "@/lib/profile/types";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ step?: string | string[] }>;
}) {
  const { step } = await searchParams;
  const initialStep = parseStep(Array.isArray(step) ? step[0] : step);
  const initialProfile = (await getMyProfile()) ?? emptyProfile();
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-headline">Set up your profile</h1>
      <OnboardingFlow initialStep={initialStep} initialProfile={initialProfile} />
    </div>
  );
}
