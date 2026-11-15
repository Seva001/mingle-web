"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Field } from "@/components/ui/field";
import { TextareaField } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormNotice } from "@/components/forms/form-notice";
import { submitSafetyReport } from "@/lib/safety/actions";

const categories = [
  ["harassment", "Harassment or bullying"],
  ["hate_or_discrimination", "Hate or discriminatory conduct"],
  ["threats", "Threats or intimidation"],
  ["impersonation", "Impersonation or deception"],
  ["inappropriate_content", "Inappropriate content"],
  ["spam_or_scam", "Spam or scams"],
  ["safety_concern", "Another safety concern"],
  ["other", "Something else"],
] as const;

export function ReportForm() {
  const [category, setCategory] = useState("");
  const [profile, setProfile] = useState("");
  const [details, setDetails] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("profile");
    if (value) setProfile(value.slice(0, 100));
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!category) { setError("Choose the category that best describes the concern."); return; }
    if (details.trim().length < 20) { setError("Add at least 20 characters so the concern is clear."); return; }
    startTransition(async () => {
      const result = await submitSafetyReport({ category, details, targetAccountId: profile || undefined });
      if (result.ok) {
        setSubmitted(true);
        setNotice(result.message);
        setDetails("");
        setCategory("");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={submit} noValidate>
        <div><label htmlFor="report-category" className="mb-1.5 block text-caption font-semibold">What is the concern? <span className="text-muted">(required)</span></label><select id="report-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-control border border-line bg-surface px-4 text-body text-foreground focus-visible:outline-offset-0" required disabled={pending || submitted}><option value="">Choose a category</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <Field label="Member reference (optional)" value={profile} onChange={(event) => setProfile(event.target.value)} maxLength={100} hint="If available, enter the member's MINGLE account reference. Do not include phone numbers, email addresses or identity documents." disabled={pending || submitted} />
        <TextareaField label="Tell us what happened" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} count={{ current: details.length, max: 2000 }} hint="Include dates or context only when they help explain the concern. Do not include passwords or unnecessary private information." required disabled={pending || submitted} />
        {error ? <FormNotice>{error}</FormNotice> : null}
        {notice ? <FormNotice tone="info">{notice}</FormNotice> : null}
        {submitted ? <Button type="button" variant="secondary" onClick={() => { setSubmitted(false); setNotice(""); }}>Submit another report</Button> : <Button type="submit" loading={pending}>Submit report</Button>}
        <p className="text-xs leading-5 text-muted">Reports are confidential and reviewed by authorized staff. MINGLE is not an emergency service. If someone is in immediate danger, contact local emergency services.</p>
      </form>
    </Card>
  );
}
