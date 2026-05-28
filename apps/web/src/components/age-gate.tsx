"use client";

import { useState } from "react";
import { btnPrimaryBlack } from "@/lib/ui/button-classes";

const key = "kanamap-age-ok";

export function AgeGate() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== "1";
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4">
      <div className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold">Adult content</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          Cannabinoid Observatory Europe is a harm reduction and information tool.
          This site discusses psychoactive substances and does not encourage purchase or consumption.
        </p>
        <button
          type="button"
          className={`mt-5 ${btnPrimaryBlack}`}
          onClick={() => {
            localStorage.setItem(key, "1");
            setVisible(false);
          }}
        >
          I am 18 or older and I understand
        </button>
      </div>
    </div>
  );
}
