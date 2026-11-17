import { brandMessagesFromEnv, forcedLanguage } from "@/lib/custom-login";
import { LANGS, LANGUAGE_COOKIE_NAME, LANGUAGE_HEADER_NAME } from "@/lib/i18n";
import { getServiceConfig } from "@/lib/service-url";
import { getAllowedLanguages, getHostedLoginTranslation } from "@/lib/zitadel";
import { JsonObject } from "@zitadel/client";
import deepmerge from "deepmerge";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const fallback = "en";
  const cookiesList = await cookies();

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let allowedLanguages = LANGS.map((l) => l.code);
  let defaultLanguage = fallback;

  try {
    const settings = await getAllowedLanguages({ serviceConfig });
    if (settings.allowedLanguages?.length) {
      const localLanguageCodes = LANGS.map((l) => l.code);
      allowedLanguages = settings.allowedLanguages.filter((l) => localLanguageCodes.includes(l));
    }
    if (settings.defaultLanguage) {
      defaultLanguage = settings.defaultLanguage;
    }
  } catch (e) {
    console.warn("Failed to load global settings", e);
  }

  let locale: string = defaultLanguage;

  const languageHeader = await (await headers()).get(LANGUAGE_HEADER_NAME);
  if (languageHeader) {
    // splits "en-US,en;q=0.9" to ["en", "US"] or ["en"]
    const headerLocale = languageHeader.split(",")[0].split("-")[0];
    if (allowedLanguages.includes(headerLocale)) {
      locale = headerLocale;
    }
  }

  const languageCookie = cookiesList?.get(LANGUAGE_COOKIE_NAME);
  if (languageCookie && languageCookie.value) {
    if (allowedLanguages.includes(languageCookie.value)) {
      locale = languageCookie.value;
    } else {
      // If the cookie tells a language that is other than the supported ones, fall back to the default.
      locale = defaultLanguage;
    }
  }

  // Custom login (saas-infra-template): one language for everybody when
  // CUSTOM_LOGIN_LANGUAGE names one, whatever ZITADEL allows and whatever the
  // browser or a cookie asks for. Texts stored in ZITADEL are then read for
  // the default language of the instance (ZITADEL may not know ours).
  const forced = forcedLanguage(LANGS.map((l) => l.code));
  const hostedLocale = forced ? defaultLanguage : locale;
  if (forced) {
    locale = forced;
  }

  const i18nOrganization = _headers.get("x-zitadel-i18n-organization") || ""; // You may need to set this header in middleware

  // Custom login (saas-infra-template): the instance's texts are the base and
  // an organization's own texts go on top. Upstream asked for the
  // organization's texts alone when the URL names one, so every page with
  // `organization=` fell back to the built-in English.
  const load = async (organization: string): Promise<JsonObject | Record<string, never>> => {
    try {
      return (await getHostedLoginTranslation({ serviceConfig, locale: hostedLocale, organization })) ?? {};
    } catch (error) {
      console.warn("Error fetching custom translations:", error);
      return {};
    }
  };
  const instanceTranslations = await load("");
  const organizationTranslations = i18nOrganization ? await load(i18nOrganization) : {};
  const translations = deepmerge(instanceTranslations, organizationTranslations) as JsonObject;

  const customMessages = translations;

  // Load locale messages, fall back to default language messages if locale not found
  let localeMessages;
  try {
    localeMessages = (await import(`../../locales/${locale}.json`)).default;
  } catch {
    try {
      localeMessages = (await import(`../../locales/${defaultLanguage}.json`)).default;
    } catch {
      localeMessages = (await import(`../../locales/${fallback}.json`)).default;
    }
  }

  const fallbackMessages = (await import(`../../locales/${fallback}.json`)).default;

  return {
    locale,
    // Brand texts of the environment sit between the shipped texts and the
    // ones stored in ZITADEL.
    messages: deepmerge.all([fallbackMessages, localeMessages, brandMessagesFromEnv(), customMessages]) as Record<
      string,
      string
    >,
  };
});
