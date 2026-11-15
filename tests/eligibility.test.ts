import { describe, expect, it } from "vitest";
import { ageOn, checkDeclaredAge, MINIMUM_AGE, parseIsoDate } from "@/lib/auth/eligibility";

const NOW = new Date("2026-11-10T12:00:00Z");

describe("parseIsoDate", () => {
  it("accepts a real date", () => {
    expect(parseIsoDate("1990-05-17")).toEqual({ year: 1990, month: 5, day: 17 });
  });
  it.each(["", "1990-5-17", "17/05/1990", "1990-02-30", "1990-13-01", "2023-02-29", "0050-01-01"])(
    "rejects %j",
    (value) => {
      expect(parseIsoDate(value)).toBeNull();
    },
  );
  it("accepts 29 Feb in a leap year", () => {
    expect(parseIsoDate("2000-02-29")).toEqual({ year: 2000, month: 2, day: 29 });
  });
});

describe("ageOn", () => {
  const birth = { year: 2008, month: 11, day: 10 };
  it("is 18 on the birthday itself", () => {
    expect(ageOn(birth, { year: 2026, month: 11, day: 10 })).toBe(18);
  });
  it("is still 17 the day before", () => {
    expect(ageOn(birth, { year: 2026, month: 11, day: 9 })).toBe(17);
  });
  it("counts a 29 Feb birthday as passed on 1 Mar in a non-leap year", () => {
    const leap = { year: 2008, month: 2, day: 29 };
    expect(ageOn(leap, { year: 2026, month: 2, day: 28 })).toBe(17);
    expect(ageOn(leap, { year: 2026, month: 3, day: 1 })).toBe(18);
  });
});

describe("checkDeclaredAge (brief §7: adults only)", () => {
  it("minimum age is 18", () => {
    expect(MINIMUM_AGE).toBe(18);
  });
  it("allows exactly 18 today", () => {
    expect(checkDeclaredAge("2008-11-10", NOW)).toEqual({ ok: true, age: 18 });
  });
  it("blocks the day before the 18th birthday", () => {
    expect(checkDeclaredAge("2008-11-11", NOW)).toEqual({ ok: false, reason: "underage" });
  });
  it("blocks a child", () => {
    expect(checkDeclaredAge("2015-01-01", NOW)).toEqual({ ok: false, reason: "underage" });
  });
  it("allows an ordinary adult", () => {
    expect(checkDeclaredAge("1990-05-17", NOW)).toEqual({ ok: true, age: 36 });
  });
  it("rejects future, implausible and malformed dates", () => {
    expect(checkDeclaredAge("2030-01-01", NOW)).toEqual({ ok: false, reason: "future" });
    expect(checkDeclaredAge("1800-01-01", NOW)).toEqual({ ok: false, reason: "implausible" });
    expect(checkDeclaredAge("nope", NOW)).toEqual({ ok: false, reason: "invalid" });
  });
});
