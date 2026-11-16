"use client";

import { handleServerActionResponse } from "@/lib/client-utils";
import { resetPassword, sendPassword } from "@/lib/server/password";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { create } from "@zitadel/client";
import { ChecksSchema } from "@zitadel/proto/zitadel/session/v2/session_service_pb";
import { LoginSettings } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertType } from "./alert";
import { AutoSubmitForm } from "./auto-submit-form";
import { useOptionalText } from "./brand-text";
import { Button, ButtonSizes, ButtonVariants } from "./button";
import { TextInput } from "./input";
import { Spinner } from "./spinner";
import { Translated } from "./translated";

type Inputs = {
  password: string;
};

type Props = {
  loginSettings: LoginSettings | undefined;
  loginName: string;
  organization?: string;
  defaultOrganization?: string;
  requestId?: string;
};

export function PasswordForm({ loginSettings, loginName, organization, defaultOrganization, requestId }: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onChange",
  });

  const t = useTranslations("password");

  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [samlData, setSamlData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const optional = useOptionalText();
  const toggleLabel =
    optional(visible ? "brand.hidePassword" : "brand.showPassword") || (visible ? "Hide password" : "Show password");

  const router = useRouter();

  async function submitPassword(values: Inputs) {
    setError("");
    setLoading(true);

    try {
      const response = await sendPassword({
        loginName,
        organization,
        defaultOrganization,
        checks: create(ChecksSchema, {
          password: { password: values.password },
        }),
        requestId,
      });

      handleServerActionResponse(response, router, setSamlData, setError);
    } catch {
      setError(t("verify.errors.couldNotVerifyPassword"));
    } finally {
      setLoading(false);
    }
  }

  async function resetPasswordAndContinue() {
    setError("");
    setInfo("");
    setLoading(true);

    const response = await resetPassword({
      loginName,
      organization,
      defaultOrganization,
      requestId,
    })
      .catch(() => {
        setError(t("errors.couldNotSendResetLink"));
        return;
      })
      .finally(() => {
        setLoading(false);
      });

    if (response && "error" in response) {
      setError(response.error as string);
      return;
    }

    setInfo(t("verify.info.passwordResetSent"));

    const params = new URLSearchParams({
      loginName: loginName,
    });

    if (organization) {
      params.append("organization", organization);
    }

    if (requestId) {
      params.append("requestId", requestId);
    }

    return router.push("/password/set?" + params);
  }

  return (
    <>
      {samlData && <AutoSubmitForm url={samlData.url} fields={samlData.fields} />}
      <form className="w-full">
        <div className={`${error && "animate-shake transform-gpu"}`}>
          <TextInput
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            {...register("password", { required: t("verify.required.password") })}
            label={t("verify.labels.password")}
            data-testid="password-text-input"
            trailing={
              <button
                type="button"
                className="cl-eye"
                onClick={() => setVisible((v) => !v)}
                aria-label={toggleLabel}
                aria-pressed={visible}
                title={toggleLabel}
              >
                {visible ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            }
          />
          {!loginSettings?.hidePasswordReset && (
            <button
              className="cl-forgot"
              onClick={() => resetPasswordAndContinue()}
              type="button"
              disabled={loading}
              data-testid="reset-button"
            >
              <Translated i18nKey="verify.resetPassword" namespace="password" />
            </button>
          )}

          {loginName && <input type="hidden" name="loginName" autoComplete="username" value={loginName} />}
        </div>

        {info && (
          <div className="py-4">
            <Alert type={AlertType.INFO}>{info}</Alert>
          </div>
        )}

        {error && (
          <div className="py-4" data-testid="error">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-3">
          <Button
            type="submit"
            className="cl-submit cl-next"
            variant={ButtonVariants.Primary}
            disabled={loading || !formState.isValid}
            onClick={handleSubmit(submitPassword)}
            data-testid="submit-button"
          >
            {loading && <Spinner className="mr-2 h-5 w-5" />} <Translated i18nKey="verify.submit" namespace="password" />
          </Button>
          <Button
            type="button"
            className="cl-submit cl-back"
            variant={ButtonVariants.Secondary}
            size={ButtonSizes.Small}
            onClick={() => router.back()}
            data-testid="back-button"
          >
            <span aria-hidden="true">←</span>
            <Translated i18nKey="back" namespace="common" />
          </Button>
        </div>
      </form>
    </>
  );
}
