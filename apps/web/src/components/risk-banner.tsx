"use client";

import Link from "next/link";
import { useState } from "react";
import { DRUGS_INFO_SERVICE_PHONE } from "@/lib/constants";

export function RiskBanner() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed left-0 right-0 top-14 z-[999] border-b border-obs-danger/40 bg-red-950/80 px-4 py-1 text-left text-xs text-red-200 backdrop-blur-sm hover:bg-red-950"
        aria-expanded={false}
      >
        <span className="obs-label">System alert — tap to expand</span>
      </button>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 top-14 z-[999] border-b border-l-4 border-obs-danger border-l-obs-danger bg-red-950/85 px-4 py-2.5 text-sm text-red-100 backdrop-blur-sm"
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1 leading-relaxed">
          <p className="obs-label mb-1 text-red-300">Harm reduction</p>
          <p>
            Synthetic cannabinoids are strictly prohibited in France. Semi-synthetic cannabinoids are
            molecules on which the scientific community has very limited data. Learn more on the{" "}
            <Link href="/understand" className="font-semibold text-white underline underline-offset-2">
              Understand
            </Link>{" "}
            page.
          </p>
          <p className="mt-1 text-xs text-red-200/90">
            Be cautious about addiction risks.{" "}
            <a
              className="font-semibold text-white underline underline-offset-2"
              href={`tel:${DRUGS_INFO_SERVICE_PHONE.replaceAll(" ", "")}`}
            >
              Drogues Info Service : {DRUGS_INFO_SERVICE_PHONE}
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="shrink-0 rounded border border-red-800/60 px-2 py-1 text-xs text-red-200 hover:bg-red-900/50"
          aria-label="Collapse alert"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
