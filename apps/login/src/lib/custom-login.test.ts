import { afterEach, describe, expect, it, vi } from "vitest";
import { brandMessagesFromEnv, forcedLanguage, primaryColorFromEnv, withPrimaryColor } from "./custom-login";

describe("custom login settings from the environment", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("forces a language only when the login has texts for it", () => {
    expect(forcedLanguage(["en", "th"])).toBeUndefined();
    vi.stubEnv("CUSTOM_LOGIN_LANGUAGE", " TH ");
    expect(forcedLanguage(["en", "th"])).toBe("th");
    vi.stubEnv("CUSTOM_LOGIN_LANGUAGE", "xx");
    expect(forcedLanguage(["en", "th"])).toBeUndefined();
  });

  it("takes brand texts that are set and leaves the others out", () => {
    expect(brandMessagesFromEnv()).toEqual({});
    vi.stubEnv("CUSTOM_LOGIN_BRAND_NAME", "ร้านดี POS");
    vi.stubEnv("CUSTOM_LOGIN_BRAND_HELP", "  ");
    vi.stubEnv("CUSTOM_LOGIN_SIGNUP_URL", "https://api.example.com/platform/signup");
    expect(brandMessagesFromEnv()).toEqual({
      brand: { name: "ร้านดี POS", signupUrl: "https://api.example.com/platform/signup" },
    });
  });

  it("accepts #rrggbb only and replaces the primary colour of both themes", () => {
    const settings = {
      lightTheme: { primaryColor: "#111111", fontColor: "#000000" },
      darkTheme: { primaryColor: "#222222" },
    };
    expect(withPrimaryColor(settings)).toBe(settings);
    vi.stubEnv("CUSTOM_LOGIN_PRIMARY_COLOR", "red; background:url(x)");
    expect(primaryColorFromEnv()).toBeUndefined();
    expect(withPrimaryColor(settings)).toBe(settings);
    vi.stubEnv("CUSTOM_LOGIN_PRIMARY_COLOR", "#2456d6");
    expect(withPrimaryColor(settings)).toEqual({
      lightTheme: { primaryColor: "#2456d6", fontColor: "#000000" },
      darkTheme: { primaryColor: "#2456d6" },
    });
    expect(withPrimaryColor(undefined)).toBeUndefined();
  });
});
