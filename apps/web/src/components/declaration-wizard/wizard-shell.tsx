"use client";

import type { ReactNode } from "react";
import { btnPrimary, btnSecondary } from "@/lib/ui/button-classes";

type Props = {
  title: string;
  subtitle: string;
  stepIndex: number;
  totalSteps: number;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideNav?: boolean;
};

export function WizardShell({
  title,
  subtitle,
  stepIndex,
  totalSteps,
  children,
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled,
  hideNav,
}: Props) {
  const progress = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl">
      {totalSteps > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900" tabIndex={-1}>
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-700">{subtitle}</p> : null}
        <div className="mt-6" aria-live="polite">
          {children}
        </div>
        {!hideNav ? (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {onBack ? (
              <button type="button" className={btnSecondary} onClick={onBack}>
                Previous
              </button>
            ) : (
              <span />
            )}
            {onNext ? (
              <button type="button" className={btnPrimary} onClick={onNext} disabled={nextDisabled}>
                {nextLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
