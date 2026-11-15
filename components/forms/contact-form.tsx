"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormNotice } from "@/components/forms/form-notice";
import { TextareaField } from "@/components/ui/textarea";

const MESSAGE_LIMIT = 1000;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [checked, setChecked] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (message.trim().length < 10) next.message = "Add a little more detail (at least 10 characters).";
    if (message.length > MESSAGE_LIMIT) next.message = `Keep your message under ${MESSAGE_LIMIT} characters.`;
    setErrors(next);
    setChecked(Object.keys(next).length === 0);
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {checked ? (
        <FormNotice tone="info">
          Your message details are complete.
        </FormNotice>
      ) : null}
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setChecked(false);
        }}
        error={errors.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setChecked(false);
        }}
        error={errors.email}
      />
      <TextareaField
        label="How can we help?"
        name="message"
        required
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          setChecked(false);
        }}
        error={errors.message}
        count={{ current: message.length, max: MESSAGE_LIMIT }}
      />
      <Button type="submit" size="lg">Send message</Button>
    </form>
  );
}
