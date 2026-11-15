"use client";

import { useState } from "react";
import { MultiChoice, SingleChoice } from "@/components/forms/choice";
import { FormNotice } from "@/components/forms/form-notice";
import { PhotoManager } from "@/components/profile/photo-manager";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextareaField } from "@/components/ui/textarea";
import {
  BIO_MAX,
  DISTANCE_CHOICES,
  GENDERS,
  INTENTIONS,
  INTERESTS,
  MAX_DISCOVERY_AGE,
  MAX_INTERESTS,
  MIN_ADULT_AGE,
  MIN_INTERESTS,
  QUESTIONS,
  type DistanceChoice,
  type Gender,
  type Interest,
  type Intention,
} from "@/lib/profile/options";
import type { Profile, ProfilePhoto } from "@/lib/profile/types";
import {
  hasErrors,
  validateBasics,
  validateIntentions,
  validatePhotos,
  validatePreferences,
  type BasicsErrors,
  type IntentionErrors,
  type PreferenceErrors,
} from "@/lib/profile/validation";

export type StepProps = {
  profile: Profile;
  /** Called with only the fields this step owns. The flow saves, then moves on. */
  onSubmit: (patch: Partial<Profile>) => void;
  onBack?: () => void;
  onSkip?: () => void;
  isLast: boolean;
  saveError: string | null;
  isSaving?: boolean;
};

function StepFrame({
  title,
  intro,
  children,
  onSubmit,
  onBack,
  onSkip,
  isLast,
  saveError,
  isSaving,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
  onSubmit: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isLast: boolean;
  saveError: string | null;
  isSaving?: boolean;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div>
        <h2 className="font-display text-title">{title}</h2>
        <p className="mt-2 text-muted">{intro}</p>
      </div>
      {children}
      {saveError ? <FormNotice>{saveError}</FormNotice> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isSaving}>
          {isLast ? "Save and finish" : "Save and continue"}
        </Button>
        {onBack ? (
          <Button variant="ghost" size="lg" onClick={onBack} disabled={isSaving}>
            Back
          </Button>
        ) : null}
        {onSkip ? (
          <Button variant="ghost" size="lg" onClick={onSkip} disabled={isSaving}>
            Skip for now
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function BasicsStep({ profile, onSubmit, ...frame }: StepProps) {
  const [name, setName] = useState(profile.displayName);
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [city, setCity] = useState(profile.city);
  const country = profile.country;
  const [bio, setBio] = useState(profile.bio);
  const [errors, setErrors] = useState<BasicsErrors>({});

  function submit() {
    const draft = {
      displayName: name.trim(),
      age: profile.age,
      gender,
      city: city.trim(),
      country: country.trim(),
      bio: bio.trim(),
    };
    const found = validateBasics(draft);
    setErrors(found);
    if (!hasErrors(found)) onSubmit(draft);
  }

  return (
    <StepFrame
      title="About you"
      intro="The basics people see on your profile."
      onSubmit={submit}
      {...frame}
    >
      <Field
        label="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="given-name"
        maxLength={40}
        error={errors.displayName}
        hint="First name or a nickname. Don’t include links or email addresses."
        required
      />
      <p className="text-caption text-muted">Age comes from the date of birth you declared at sign-up and cannot be edited here.</p>
      {errors.age ? <p role="alert" className="text-caption font-medium text-danger">Your age is unavailable. Please contact support before continuing.</p> : null}
      <SingleChoice
        legend="I am"
        options={GENDERS}
        value={gender}
        onChange={setGender}
        error={errors.gender}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="City or area"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
          maxLength={60}
          error={errors.city}
          hint="Shown as a city only. Never your exact location."
          required
        />
        <Field
          label="Launch market"
          value={country}
          readOnly
          autoComplete="country-name"
          maxLength={60}
          error={errors.country}
          hint="Your country is based on the launch market selected at registration."
          required
        />
      </div>
      <TextareaField
        label="A little about you"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={BIO_MAX}
        count={{ current: bio.length, max: BIO_MAX }}
        error={errors.bio}
        hint="What you enjoy, what matters to you, what a good week looks like."
        required
      />
    </StepFrame>
  );
}

export function PhotosStep({ profile, onSubmit, ...frame }: StepProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>(profile.photos);
  const [error, setError] = useState<string | undefined>();

  function submit() {
    const found = validatePhotos(photos);
    setError(found ?? undefined);
    if (!found) onSubmit({ photos });
  }

  return (
    <StepFrame
      title="Photos"
      intro="Clear, recent photos of you help people decide if they’d like to connect."
      onSubmit={submit}
      {...frame}
    >
      <PhotoManager
        photos={photos}
        onChange={(next) => {
          setPhotos(next);
          setError(undefined);
        }}
        error={error}
      />
    </StepFrame>
  );
}

export function IntentionsStep({ profile, onSubmit, ...frame }: StepProps) {
  const [intention, setIntention] = useState<Intention | null>(profile.intention);
  const [interests, setInterests] = useState<Interest[]>(profile.interests);
  const [errors, setErrors] = useState<IntentionErrors>({});

  function submit() {
    const found = validateIntentions({ intention, interests });
    setErrors(found);
    if (!hasErrors(found)) onSubmit({ intention, interests });
  }

  return (
    <StepFrame
      title="What you’re looking for"
      intro="Relationship intentions and interests carry the most weight when we suggest people, so be honest."
      onSubmit={submit}
      {...frame}
    >
      <SingleChoice
        legend="I’m looking for"
        options={INTENTIONS}
        value={intention}
        onChange={setIntention}
        error={errors.intention}
        columns={1}
      />
      <MultiChoice
        legend="Interests"
        hint={`Pick ${MIN_INTERESTS} to ${MAX_INTERESTS}.`}
        options={INTERESTS.map((i) => ({ value: i, label: i }))}
        value={interests}
        onChange={setInterests}
        max={MAX_INTERESTS}
        error={errors.interests}
      />
    </StepFrame>
  );
}

export function QuestionnaireStep({ profile, onSubmit, ...frame }: StepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(profile.answers);

  return (
    <StepFrame
      title="Compatibility questions"
      intro="Optional. Each answer helps explain why someone is suggested to you. Skip any you’d rather not answer; you can change them any time."
      onSubmit={() => onSubmit({ answers })}
      {...frame}
    >
      {QUESTIONS.map((q) => (
        <SingleChoice
          key={q.id}
          legend={q.prompt}
          hint={`Why we ask: ${q.why}`}
          options={q.options.map((o) => ({ value: o.id, label: o.label }))}
          value={answers[q.id] ?? null}
          onChange={(next) => setAnswers((prev) => ({ ...prev, [q.id]: next }))}
        />
      ))}
    </StepFrame>
  );
}

const DISTANCE_OPTIONS = DISTANCE_CHOICES.map((d) => ({
  value: d === null ? "any" : String(d),
  label: d === null ? "Anywhere in my country" : `Within ${d} km`,
}));

export function PreferencesStep({ profile, onSubmit, ...frame }: StepProps) {
  const [interestedIn, setInterestedIn] = useState<Gender[]>(profile.interestedIn);
  const [ageMin, setAgeMin] = useState(String(profile.ageMin));
  const [ageMax, setAgeMax] = useState(String(profile.ageMax));
  const [distance, setDistance] = useState<string>(
    profile.maxDistanceKm === null ? "any" : String(profile.maxDistanceKm),
  );
  const [errors, setErrors] = useState<PreferenceErrors>({});

  function submit() {
    const maxDistanceKm = (distance === "any" ? null : Number(distance)) as DistanceChoice;
    const draft = {
      interestedIn,
      ageMin: ageMin.trim() === "" ? NaN : Number(ageMin),
      ageMax: ageMax.trim() === "" ? NaN : Number(ageMax),
      maxDistanceKm,
    };
    const found = validatePreferences(draft);
    setErrors(found);
    if (!hasErrors(found)) onSubmit(draft);
  }

  return (
    <StepFrame
      title="Who you’d like to meet"
      intro="Discovery only suggests people who fit your preferences, and whose preferences fit you."
      onSubmit={submit}
      {...frame}
    >
      <MultiChoice
        legend="Interested in"
        options={GENDERS}
        value={interestedIn}
        onChange={setInterestedIn}
        error={errors.interestedIn}
      />
      <div className="flex flex-col gap-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Youngest age"
            type="number"
            inputMode="numeric"
            min={MIN_ADULT_AGE}
            max={MAX_DISCOVERY_AGE}
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
          />
          <Field
            label="Oldest age"
            type="number"
            inputMode="numeric"
            min={MIN_ADULT_AGE}
            max={MAX_DISCOVERY_AGE}
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
          />
        </div>
        {errors.ageRange ? (
          <p className="text-caption font-medium text-danger">{errors.ageRange}</p>
        ) : null}
      </div>
      <SingleChoice
        legend="How far away?"
        options={DISTANCE_OPTIONS}
        value={distance}
        onChange={setDistance}
        error={errors.distance}
      />
    </StepFrame>
  );
}
