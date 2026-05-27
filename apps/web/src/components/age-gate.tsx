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
        <h2 className="text-2xl font-semibold">Contenu réservé aux adultes</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          Cannabinoid Observatory Europe est un outil d&apos;information et de réduction des risques.
          Le site traite de substances psychoactives et n&apos;encourage ni l&apos;achat ni la
          consommation.
        </p>
        <button
          type="button"
          className={`mt-5 ${btnPrimaryBlack}`}
          onClick={() => {
            localStorage.setItem(key, "1");
            setVisible(false);
          }}
        >
          J&apos;ai 18 ans ou plus et je comprends
        </button>
      </div>
    </div>
  );
}
