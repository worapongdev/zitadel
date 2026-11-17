/**
 * Custom login (saas-infra-template): what a deployment sets through the
 * environment instead of ZITADEL's settings, so one image serves every
 * deployment without a set-up step:
 *
 * - CUSTOM_LOGIN_LANGUAGE: the one language of the login (a file of
 *   `locales/`, e.g. `th`). ZITADEL does not know every language we ship,
 *   so this does not depend on the instance's allowed languages.
 * - CUSTOM_LOGIN_BRAND_NAME, CUSTOM_LOGIN_BRAND_HELP: the product name and
 *   the help line of the brand panel.
 * - CUSTOM_LOGIN_SIGNUP_URL: where "create an account" goes (https or a
 *   path).
 * - CUSTOM_LOGIN_PRIMARY_COLOR: `#rrggbb`, instead of the primary colour of
 *   ZITADEL's branding (label policy).
 *
 * Unset or empty means "not set". Texts stored in ZITADEL (hosted login
 * translation) still win over the brand texts given here.
 */

function setting(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** The forced language, when it is one this login has texts for. */
export function forcedLanguage(available: string[]): string | undefined {
  const language = setting("CUSTOM_LOGIN_LANGUAGE").toLowerCase();
  return available.includes(language) ? language : undefined;
}

/** Messages of the `brand` namespace taken from the environment. */
export function brandMessagesFromEnv(): { brand?: Record<string, string> } {
  const brand: Record<string, string> = {};
  const name = setting("CUSTOM_LOGIN_BRAND_NAME");
  const help = setting("CUSTOM_LOGIN_BRAND_HELP");
  const signupUrl = setting("CUSTOM_LOGIN_SIGNUP_URL");
  if (name) brand.name = name;
  if (help) brand.help = help;
  if (signupUrl) brand.signupUrl = signupUrl;
  return Object.keys(brand).length ? { brand } : {};
}

/** The primary colour from the environment, or undefined. */
export function primaryColorFromEnv(): string | undefined {
  const color = setting("CUSTOM_LOGIN_PRIMARY_COLOR");
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : undefined;
}

/** `settings` with the primary colour of both themes replaced, when one is set. */
export function withPrimaryColor<T extends { lightTheme?: object; darkTheme?: object }>(
  settings: T | undefined,
): T | undefined {
  const color = primaryColorFromEnv();
  if (!settings || !color) {
    return settings;
  }
  return {
    ...settings,
    lightTheme: { ...settings.lightTheme, primaryColor: color },
    darkTheme: { ...settings.darkTheme, primaryColor: color },
  };
}
