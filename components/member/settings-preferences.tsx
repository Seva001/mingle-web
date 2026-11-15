"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Shield, UserRound, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Switch } from "@/components/ui/switch";

export function SettingsPreferences() {
  const [emailPreference, setEmailPreference] = useState(false);
  const [productPreference, setProductPreference] = useState(false);
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Card>
        <h2 className="text-title font-semibold">Appearance</h2>
        <p className="mt-2 text-sm text-muted">Light is the default. Choose Dark or System at any time.</p>
        <ThemeToggle className="mt-5" />
      </Card>
      <Card>
        <div className="flex items-center gap-3"><Bell className="size-5" aria-hidden /><h2 className="text-title font-semibold">Notification preferences</h2></div>
        <p className="mt-2 text-sm leading-6 text-muted">Choose which updates you would like to receive from Mingle.</p>
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-4"><span className="text-sm">Email updates</span><Switch checked={emailPreference} onCheckedChange={setEmailPreference} label="Email updates preference" /></div>
          <div className="flex items-center justify-between gap-4"><span className="text-sm">Product announcements</span><Switch checked={productPreference} onCheckedChange={setProductPreference} label="Product announcements preference" /></div>
        </div>
        <p role="status" className="mt-4 text-caption text-muted">Your notification preferences help tailor the updates you receive.</p>
        <Link href="/notifications" className="mt-4 inline-block text-caption font-semibold underline">Open notification centre</Link>
      </Card>
      <Card>
        <div className="flex items-center gap-3"><Shield className="size-5" aria-hidden /><h2 className="text-title font-semibold">Safety and privacy</h2></div>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <Link className="underline underline-offset-4" href="/safety">Safety centre</Link>
          <Link className="underline underline-offset-4" href="/report">Report a concern</Link>
          <Link className="underline underline-offset-4" href="/privacy">Privacy policy</Link>
          <Link className="underline underline-offset-4" href="/cookies">Cookie information</Link>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3"><UserRound className="size-5" aria-hidden /><h2 className="text-title font-semibold">Profile and discovery</h2></div>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <Link className="underline underline-offset-4" href="/profile">View profile</Link>
          <Link className="underline underline-offset-4" href="/onboarding">Edit profile details</Link>
          <Link className="underline underline-offset-4" href="/discover">Discovery preferences</Link>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3"><SlidersHorizontal className="size-5" aria-hidden /><h2 className="text-title font-semibold">Account controls</h2></div>
        <p className="mt-2 text-sm leading-6 text-muted">Manage your account access, personal information and account lifecycle from this section.</p>
      </Card>
    </div>
  );
}
