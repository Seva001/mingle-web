"use client";

import { useState } from "react";
import { Bookmark, Heart, SlidersHorizontal, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompatibilityBadge, NotificationDot, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Switch } from "@/components/ui/switch";
import { Chip, Tag } from "@/components/ui/tag";

const interests = ["Hiking", "Cooking", "Live music", "Reading", "Travel"];

export function Demo() {
  const [picked, setPicked] = useState<string[]>(["Cooking"]);
  const [weekly, setWeekly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("name@");
  const emailError =
    email.includes("@") && email.split("@")[1]
      ? undefined
      : "Enter a full email address, like name@example.com.";

  return (
    <>
      <Section id="buttons" title="Buttons and controls">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Get started</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Report</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button
              loading={loading}
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 1400);
              }}
            >
              {loading ? "Saving" : "Save changes"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <IconButton label="Filters" variant="surface">
              <SlidersHorizontal className="size-5" aria-hidden />
            </IconButton>
            <span className="relative">
              <IconButton label="Notifications" variant="surface">
                <Heart className="size-5" aria-hidden />
              </IconButton>
              <span className="absolute -top-0.5 -right-0.5">
                <NotificationDot label="New activity" />
              </span>
            </span>
          </div>
        </Card>
      </Section>

      <Section id="tags" title="Tags, chips and switches">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {interests.map((name) => (
              <Chip
                key={name}
                selected={picked.includes(name)}
                onSelectedChange={(on) =>
                  setPicked((cur) => (on ? [...cur, name] : cur.filter((n) => n !== name)))
                }
              >
                {name}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>Long-term</Tag>
            <Tag>Active weekends</Tag>
            <Tag>Wants kids someday</Tag>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-body">Weekly activity summary</span>
            <Switch label="Weekly activity summary" checked={weekly} onCheckedChange={setWeekly} />
          </div>
        </Card>
      </Section>

      <Section id="forms" title="Form field">
        <Card className="max-w-md">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="We use this to sign you in and send security notices."
            error={emailError}
            autoComplete="email"
          />
        </Card>
      </Section>

      <Section id="discovery" title="Photo-led card (specimen)">
        <p className="text-caption text-muted">
          Specimen only. Not a real member; photos arrive in phase 3.
        </p>
        <div
          className="flex scrollbar-none gap-4 overflow-x-auto pb-2"
          role="list"
          aria-label="New connections specimen"
        >
          {["Ada Specimen", "Bo Specimen", "Cy Specimen", "Di Specimen"].map((n, i) => (
            <div
              key={n}
              role="listitem"
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <Avatar name={n} size={64} highlighted={i === 0} />
              <span className="w-full truncate text-center text-caption text-muted">
                {n.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        <div
          className="relative mx-auto mt-2 aspect-[3/4] w-full max-w-sm overflow-hidden rounded-card text-on-photo shadow-card"
          style={{ background: "linear-gradient(160deg, #3a2a4a 0%, #7a3b2e 55%, #c2693a 100%)" }}
        >
          <div className="absolute inset-0" style={{ background: "var(--photo-scrim)" }} />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
            <CompatibilityBadge className="w-fit">
              Similar intentions and lifestyle
            </CompatibilityBadge>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-headline">Ada, 29</h3>
              <VerifiedBadge />
            </div>
            <p className="text-caption opacity-90">Lagos · Hiking, cooking, live music</p>
            <div className="mt-1 flex items-center justify-between">
              <IconButton label="Pass" size="lg" variant="photo">
                <X className="size-6" aria-hidden />
              </IconButton>
              <IconButton label="Save for later" size="lg" variant="photo">
                <Bookmark className="size-6 text-star" aria-hidden />
              </IconButton>
              <IconButton label="Like" size="lg" variant="photo">
                <Heart className="size-6 text-brand" aria-hidden />
              </IconButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <h2 id={id} className="text-title font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
