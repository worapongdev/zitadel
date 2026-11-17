"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { forwardRef, useState } from "react";
import { useOptionalText } from "./brand-text";
import { TextInput, TextInputProps } from "./input";

/**
 * Custom login (saas-infra-template): a password field with a button that
 * shows or hides what was typed. Labels of the button: `brand.showPassword`
 * and `brand.hidePassword`.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<TextInputProps, "type" | "trailing">>((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const optional = useOptionalText();
  const label =
    optional(visible ? "brand.hidePassword" : "brand.showPassword") || (visible ? "Hide password" : "Show password");
  return (
    <TextInput
      {...props}
      ref={ref}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="cl-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={label}
          aria-pressed={visible}
          title={label}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
});
PasswordInput.displayName = "PasswordInput";
