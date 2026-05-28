"use client";

import { useState } from "react";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

const key = "kanamap-age-ok";

export function AgeGate() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== "1";
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-obs-void/85 p-4 backdrop-blur-sm">
      <ObsPanel className="max-w-lg">
        <div className="p-6">
          <p className="obs-label text-obs-signal">Access control</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Adult content</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Cannabinoid Observatory Europe is a harm reduction and information tool. This site
            discusses psychoactive substances and does not encourage purchase or consumption.
          </p>
          <ObsButton
            variant="primary"
            className="mt-5 w-full"
            onClick={() => {
              localStorage.setItem(key, "1");
              setVisible(false);
            }}
          >
            I am 18 or older and I understand
          </ObsButton>
        </div>
      </ObsPanel>
    </div>
  );
}
