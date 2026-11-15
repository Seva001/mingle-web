import { describe, expect, it } from "vitest";
import { profileCompletion } from "@/lib/profile/completion";
import { QUESTIONS } from "@/lib/profile/options";
import { parseStoredProfile } from "@/lib/profile/sanitize";
import { emptyProfile, type Profile } from "@/lib/profile/types";
import {
  validateBasics,
  validateIntentions,
  validatePhotos,
  validatePreferences,
} from "@/lib/profile/validation";

const PHOTO = { id: "p1", dataUrl: "data:image/jpeg;base64,AAAA" };

function complete(): Profile {
  return {
    ...emptyProfile(),
    displayName: "Ada",
    age: 29,
    gender: "woman",
    city: "Abuja",
    country: "Nigeria",
    bio: "I love long walks, cooking for friends and good conversation.",
    photos: [PHOTO],
    intention: "long_term",
    interests: ["Travel", "Cooking", "Music"],
    interestedIn: ["man"],
  };
}

describe("validateBasics", () => {
  it("accepts a complete set", () => {
    expect(validateBasics(complete())).toEqual({});
  });
  it("rejects under-18 ages (brief §7)", () => {
    expect(validateBasics({ ...complete(), age: 17 }).age).toBeDefined();
  });
  it("rejects links and emails in the display name", () => {
    expect(validateBasics({ ...complete(), displayName: "ada@mail.com" }).displayName).toBeDefined();
    expect(validateBasics({ ...complete(), displayName: "see www.x.com" }).displayName).toBeDefined();
  });
  it("requires a real bio, a city and a country", () => {
    const e = validateBasics({ ...complete(), bio: "hi", city: "", country: "" });
    expect(Object.keys(e).sort()).toEqual(["bio", "city", "country"]);
  });
});

describe("other validators", () => {
  it("needs one to six photos", () => {
    expect(validatePhotos([])).not.toBeNull();
    expect(validatePhotos([PHOTO])).toBeNull();
    expect(validatePhotos(Array(7).fill(PHOTO))).not.toBeNull();
  });
  it("needs an intention and 3 to 8 interests", () => {
    expect(Object.keys(validateIntentions({ intention: null, interests: [] })).sort()).toEqual([
      "intention",
      "interests",
    ]);
    expect(validateIntentions({ intention: "marriage", interests: ["Travel", "Art", "Yoga"] })).toEqual({});
  });
  it("needs sensible preferences", () => {
    expect(validatePreferences({ interestedIn: [], ageMin: 18, ageMax: 40, maxDistanceKm: null }).interestedIn).toBeDefined();
    expect(validatePreferences({ interestedIn: ["man"], ageMin: 17, ageMax: 40, maxDistanceKm: null }).ageRange).toBeDefined();
    expect(validatePreferences({ interestedIn: ["man"], ageMin: 40, ageMax: 30, maxDistanceKm: null }).ageRange).toBeDefined();
    expect(validatePreferences({ interestedIn: ["man"], ageMin: 25, ageMax: 40, maxDistanceKm: 77 as never }).distance).toBeDefined();
    expect(validatePreferences({ interestedIn: ["man"], ageMin: 25, ageMax: 40, maxDistanceKm: 50 })).toEqual({});
  });
});

describe("profileCompletion", () => {
  it("is 0% and not complete when empty", () => {
    const c = profileCompletion(emptyProfile());
    expect(c.percent).toBe(0);
    expect(c.onboardingComplete).toBe(false);
    expect(c.nextSection).toBe("basics");
  });
  it("onboarding completes without the optional questionnaire", () => {
    const c = profileCompletion(complete());
    expect(c.onboardingComplete).toBe(true);
    expect(c.percent).toBe(80);
    expect(c.nextSection).toBe("questionnaire");
  });
  it("reaches 100% when every question is answered", () => {
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options[0]!.id]));
    const c = profileCompletion({ ...complete(), answers });
    expect(c.percent).toBe(100);
    expect(c.nextSection).toBeNull();
  });
});

describe("parseStoredProfile treats storage as untrusted", () => {
  it("returns defaults for junk", () => {
    expect(parseStoredProfile(null)).toEqual(emptyProfile());
    expect(parseStoredProfile("{not json")).toEqual(emptyProfile());
    expect(parseStoredProfile("[1,2]")).toEqual(emptyProfile());
  });
  it("round-trips a valid profile", () => {
    const p = complete();
    expect(parseStoredProfile(JSON.stringify(p))).toEqual(p);
  });
  it("drops invalid values and unsafe photos", () => {
    const parsed = parseStoredProfile(
      JSON.stringify({
        ...complete(),
        age: 12,
        gender: "robot",
        interests: ["Travel", "Nope", "Travel"],
        photos: [PHOTO, { id: "x", dataUrl: "javascript:alert(1)" }, { id: "y", dataUrl: "data:text/html;base64,AAAA" }],
        answers: { v_family: "central", v_family_bogus: "x", l_rhythm: "nope" },
        ageMin: 10,
        ageMax: 50,
        maxDistanceKm: 3,
      }),
    );
    expect(parsed.age).toBeNull();
    expect(parsed.gender).toBeNull();
    expect(parsed.interests).toEqual(["Travel"]);
    expect(parsed.photos).toEqual([PHOTO]);
    expect(parsed.answers).toEqual({ v_family: "central" });
    expect(parsed.ageMin).toBe(18);
    expect(parsed.maxDistanceKm).toBeNull();
  });
});
