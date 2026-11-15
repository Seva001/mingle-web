"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormNotice } from "@/components/forms/form-notice";
import { Field } from "@/components/ui/field";
import { updateMyMarketSettingsAction, type MarketSettingsActionState } from "@/lib/markets/actions";
import type { MyMarketSettings } from "@/lib/markets/server";

const initialState: MarketSettingsActionState = { status: "idle" };

export function MarketSettings({ settings }: { settings: MyMarketSettings }) {
  const [state, action, pending] = useActionState(updateMyMarketSettingsAction, initialState);
  return (
    <Card>
      <h2 className="text-title font-semibold">Language and region</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your launch market is <strong>{settings.marketName}</strong> ({settings.marketCode}). It cannot be changed from this screen because market eligibility is tied to your registration and that market’s minimum age.
      </p>
      <form action={action} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Language
          <select name="locale" defaultValue={settings.locale} required
            className="h-12 rounded-xl border border-border bg-surface px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            {settings.supportedLocales.map((locale) => <option key={locale} value={locale}>{locale}</option>)}
          </select>
        </label>
        <Field label="Timezone" name="timezone" defaultValue={settings.timezone}
          hint="Use an IANA timezone, for example Africa/Lagos or Europe/London." required maxLength={80} />
        {state.message ? <FormNotice tone={state.status === "error" ? "error" : "info"}>{state.message}</FormNotice> : null}
        <div><Button type="submit" loading={pending}>Save region settings</Button></div>
      </form>
    </Card>
  );
}
