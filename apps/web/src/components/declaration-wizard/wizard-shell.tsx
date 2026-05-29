"use client";

import type { ReactNode } from "react";
import { ObsButton } from "@/components/ui/obs";

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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {totalSteps > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="uppercase tracking-wider">
              Step {stepIndex + 1} / {totalSteps}
            </span>
            <span className="text-obs-signal">{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-obs-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-obs-violet to-obs-signal transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="obs-panel p-5 sm:p-6">
        <h1 className="text-xl font-semibold text-zinc-100 sm:text-2xl" tabIndex={-1}>
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p> : null}
        <div className="mt-6" aria-live="polite">
          {children}
        </div>
        {!hideNav ? (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {onBack ? (
              <ObsButton variant="outline" onClick={onBack}>
                Previous
              </ObsButton>
            ) : (
              <span />
            )}
            {onNext ? (
              <ObsButton variant="primary" onClick={onNext} disabled={nextDisabled}>
                {nextLabel}
              </ObsButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
