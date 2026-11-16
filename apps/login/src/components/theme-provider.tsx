"use client";
import { ThemeProvider as ThemeP } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    // Custom login (ADR-0017): one light theme, like Platform's sign-up pages;
    // the visitor's system setting and an older stored choice are ignored.
    <ThemeP attribute="class" defaultTheme="light" forcedTheme="light" storageKey="cp-theme" value={{ dark: "dark" }}>
      {children}
    </ThemeP>
  );
}
