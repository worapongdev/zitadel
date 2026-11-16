"use client";

import { Logo } from "@/components/logo";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { useTranslations } from "next-intl";
import { Children, ReactNode } from "react";
import { ThemeWrapper } from "./theme-wrapper";

/**
 * Custom login (saas-infra-template, ADR-0017). Replaces upstream's card
 * layouts with the full-bleed layout of Platform's sign-up pages:
 *
 * - a brand panel (logo or the product's initial, product name, a headline,
 *   a help line) on the left, tinted from the branding's primary colour;
 * - the page's own title and form on the right.
 *
 * The layout fills the screen. On narrow screens the
 * brand panel is hidden and the brand row moves above the form. The
 * switch is CSS only (globals.scss, `.cl-*`), so the server-rendered page and
 * the hydrated one are the same.
 *
 * Children, as upstream: with two children the first is the title block and
 * the second the form; a single child is the whole content.
 *
 * The brand texts are the messages `brand.name`, `brand.headline`,
 * `brand.text` and `brand.help` (locales/en.json; a deployment overrides
 * them with ZITADEL's hosted login translation). A missing message is left
 * out.
 */
export function DynamicTheme({
  branding,
  children,
}: {
  children: ReactNode | ((isSideBySide: boolean) => ReactNode);
  branding?: BrandingSettings;
}) {
  const t = useTranslations();
  const text = (key: "brand.name" | "brand.headline" | "brand.text" | "brand.help") => (t.has(key) ? t(key) : "");
  const name = text("brand.name").trim();
  const headline = text("brand.headline").trim();
  const description = text("brand.text").trim();
  const help = text("brand.help").trim();

  const actualChildren: ReactNode =
    typeof children === "function" ? (children as (isSideBySide: boolean) => ReactNode)(true) : children;
  const childArray = Children.toArray(actualChildren);
  const hasTitleAndForm = childArray.length === 2;
  const hasLogo = Boolean(branding?.lightTheme?.logoUrl || branding?.darkTheme?.logoUrl);

  const brandRow = (className: string) => (
    <div className={className}>
      {hasLogo ? (
        <Logo lightSrc={branding?.lightTheme?.logoUrl} darkSrc={branding?.darkTheme?.logoUrl} height={44} width={44} />
      ) : (
        name && (
          <div className="cl-mark" aria-hidden="true">
            {Array.from(name)[0]?.toUpperCase()}
          </div>
        )
      )}
      {name && <span>{name}</span>}
    </div>
  );

  return (
    <ThemeWrapper branding={branding}>
      <div className="cl-page">
        <div className="cl-card">
          <aside className="cl-brand">
            {brandRow("cl-brandrow")}
            <div className="cl-pitch">
              {headline && <h2>{headline}</h2>}
              {description && <p>{description}</p>}
            </div>
            <div className="cl-foot">{help}</div>
          </aside>

          <main className="cl-formside">
            {brandRow("cl-brandrow cl-mobilebrand")}
            <div className="cl-form">
              {hasTitleAndForm ? (
                <>
                  <div className="cl-head">{childArray[0]}</div>
                  <div className="space-y-6">{childArray[1]}</div>
                </>
              ) : (
                <div className="space-y-6">{actualChildren}</div>
              )}
              {help && <p className="cl-help">{help}</p>}
            </div>
          </main>
        </div>
      </div>
    </ThemeWrapper>
  );
}
