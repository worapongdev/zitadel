import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { DynamicTheme } from "./dynamic-theme";

vi.mock("./theme-wrapper", () => ({ ThemeWrapper: ({ children }: any) => <>{children}</> }));

const wrap = (messages: any, ui: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe("custom DynamicTheme", () => {
  it("shows brand texts, title on the form side, and leaves missing texts out", () => {
    const { container } = wrap(
      { brand: { name: "ร้านดี POS", headline: "ยินดีต้อนรับกลับมา", text: "รายละเอียด", help: "ติดต่อเรา" } },
      <DynamicTheme>
        <div>
          <h1>Title</h1>
        </div>
        <form>
          <input />
        </form>
      </DynamicTheme>,
    );
    expect(container.querySelector(".cl-mark")?.textContent).toBe("ร");
    expect(container.querySelector(".cl-brandrow span")?.textContent).toBe("ร้านดี POS");
    expect(container.querySelector(".cl-pitch h2")?.textContent).toBe("ยินดีต้อนรับกลับมา");
    expect(container.querySelector(".cl-pitch p")?.textContent).toBe("รายละเอียด");
    expect(container.querySelector(".cl-head h1")?.textContent).toBe("Title");
    expect(container.querySelector(".cl-form form")).not.toBeNull();
    expect(container.querySelector(".cl-help")?.textContent).toBe("ติดต่อเรา");
  });
  it("works without brand messages and with a single child", () => {
    const { container } = wrap(
      { common: { back: "Back" } },
      <DynamicTheme>
        <p>only</p>
      </DynamicTheme>,
    );
    expect(container.querySelector(".cl-mark")).toBeNull();
    expect(container.querySelector(".cl-pitch h2")).toBeNull();
    expect(container.querySelector(".cl-head")).toBeNull();
    expect(container.querySelector(".cl-form p")?.textContent).toBe("only");
  });
  it("uses the branding logo instead of the initial", () => {
    const { container } = wrap(
      { brand: { name: "Shop" } },
      <DynamicTheme branding={{ lightTheme: { logoUrl: "https://example.com/l.png" } } as any}>
        <p>x</p>
      </DynamicTheme>,
    );
    expect(container.querySelector(".cl-mark")).toBeNull();
    expect(container.querySelector(".cl-brandrow img")).not.toBeNull();
  });
});
