"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  onVerify?: (token: string) => void;
  inputName?: string;
};

export function TurnstileWidget({ onVerify, inputName = "turnstileToken" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current || !window.turnstile || widgetId.current) return;

    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (nextToken) => {
        setToken(nextToken);
        onVerify?.(nextToken);
      },
    });

    return () => {
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onVerify, siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div ref={ref} className="my-3" />
      <input type="hidden" name={inputName} value={token} />
    </>
  );
}
