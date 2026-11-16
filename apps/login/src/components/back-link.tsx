"use client";

import { useRouter } from "next/navigation";
import { Translated } from "./translated";

/** Custom login (saas-infra-template): "back" as a text link above a page title. */
export function BackLink() {
  const router = useRouter();
  return (
    <button type="button" className="cl-backlink" onClick={() => router.back()} data-testid="back-button">
      <span aria-hidden="true">←</span>
      <Translated i18nKey="back" namespace="common" />
    </button>
  );
}
