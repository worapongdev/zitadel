import { useTranslations } from "next-intl";

/**
 * Custom login (saas-infra-template): texts that a deployment may leave out.
 * Returns "" when the message does not exist, so the caller can skip the
 * element instead of showing a key.
 */
export function useOptionalText(): (key: string) => string {
  const t = useTranslations() as unknown as ((key: string) => string) & { has?: (key: string) => boolean };
  return (key: string) => (typeof t.has === "function" && t.has(key) ? t(key).trim() : "");
}

/** A small pill above a page title, e.g. "Step 1 of 2". Nothing when the message is missing. */
export function StepChip({ i18nKey }: { i18nKey: string }) {
  const text = useOptionalText()(i18nKey);
  return text ? <p className="cl-chip">{text}</p> : null;
}
