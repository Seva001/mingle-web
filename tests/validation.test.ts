import { describe, expect, it } from "vitest";
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateNewPassword,
  validateSignIn,
  validateSignUp,
} from "@/lib/validation/auth";

const NOW = new Date("2026-11-10T12:00:00Z");
const valid = {
  email: "  Ada@Example.com ",
  password: "a long enough passphrase",
  dateOfBirth: "1990-05-17",
  acceptedTerms: true,
};

describe("validateEmail", () => {
  it("trims and lower-cases", () => {
    expect(validateEmail("  Ada@Example.com ")).toEqual({ ok: true, value: "ada@example.com" });
  });
  it.each(["", "ada", "ada@", "@example.com", "ada@example", "a b@example.com"])(
    "rejects %j",
    (value) => {
      expect(validateEmail(value).ok).toBe(false);
    },
  );
});

describe("validateNewPassword", () => {
  it("enforces the minimum length", () => {
    expect(validateNewPassword("x".repeat(PASSWORD_MIN_LENGTH - 1), "").ok).toBe(false);
    expect(validateNewPassword("x".repeat(PASSWORD_MIN_LENGTH), "").ok).toBe(true);
  });
  it("enforces the maximum length", () => {
    expect(validateNewPassword("x".repeat(129), "").ok).toBe(false);
  });
  it("rejects a password equal to the email", () => {
    expect(validateNewPassword("ada@example.com", "ada@example.com").ok).toBe(false);
  });
});

describe("validateSignUp", () => {
  it("accepts a valid adult and normalises the email", () => {
    expect(validateSignUp(valid, NOW)).toEqual({
      ok: true,
      value: {
        email: "ada@example.com",
        password: valid.password,
        dateOfBirth: "1990-05-17",
      },
    });
  });
  it("flags under-18 and nothing else, even with other mistakes", () => {
    expect(
      validateSignUp({ ...valid, dateOfBirth: "2015-01-01", password: "x", email: "" }, NOW),
    ).toEqual({ ok: false, underage: true, fieldErrors: {} });
  });
  it("reports each field error", () => {
    const result = validateSignUp(
      { email: "nope", password: "short", dateOfBirth: "", acceptedTerms: false },
      NOW,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual([
        "dateOfBirth",
        "email",
        "password",
        "terms",
      ]);
    }
  });
  it("requires the consent confirmation", () => {
    const result = validateSignUp({ ...valid, acceptedTerms: false }, NOW);
    expect(result.ok).toBe(false);
  });
  it("rejects a mismatched password confirmation", () => {
    const result = validateSignUp({ ...valid, confirmPassword: "a different passphrase" }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.confirmPassword).toBe("Your passwords don’t match.");
  });

  it("accepts matching password confirmation", () => {
    expect(validateSignUp({ ...valid, confirmPassword: valid.password }, NOW).ok).toBe(true);
  });
});

describe("validateSignIn", () => {
  it("accepts any non-empty password (no length rule on sign-in)", () => {
    expect(validateSignIn({ email: "ada@example.com", password: "x" }).ok).toBe(true);
  });
  it("requires both fields", () => {
    const result = validateSignIn({ email: "", password: "" });
    expect(result.ok).toBe(false);
  });
});
