/** Shared Tailwind classes for interactive controls — Observatory theme */

export const btnFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-obs-void motion-reduce:transition-none";

export const btnPrimary =
  `inline-flex min-h-11 items-center justify-center rounded bg-obs-violet px-4 py-3 font-medium text-white transition-colors hover:bg-violet-500 active:bg-violet-700 border border-violet-600/50 ${btnFocus}`;

export const btnPrimaryBlack =
  `inline-flex min-h-11 w-full items-center justify-center rounded bg-obs-violet px-4 py-3 font-medium text-white transition-colors hover:bg-violet-500 active:bg-violet-700 border border-violet-600/50 ${btnFocus}`;

export const btnSecondary =
  `inline-flex min-h-11 items-center justify-center rounded border border-obs-border bg-obs-elevated px-3 py-2 text-zinc-200 transition-colors hover:border-obs-violet hover:text-white active:bg-obs-surface ${btnFocus}`;

export const btnDestructive =
  `inline-flex min-h-11 items-center justify-center rounded bg-obs-danger px-3 py-2 text-white transition-colors hover:bg-red-700 active:bg-red-800 ${btnFocus}`;

export const btnNavPill =
  `inline-flex min-h-11 items-center rounded bg-obs-violet px-3 py-1.5 text-white transition-colors hover:bg-violet-500 active:bg-violet-700 ${btnFocus}`;

export const btnNavPillBlack =
  `inline-flex min-h-11 items-center rounded bg-obs-violet px-3 py-1.5 text-white transition-colors hover:bg-violet-500 active:bg-violet-700 ${btnFocus}`;

export const btnGhost =
  `inline-flex min-h-11 items-center rounded px-3 py-2 text-zinc-300 underline-offset-4 transition-colors hover:bg-obs-elevated hover:text-white hover:underline active:bg-obs-surface ${btnFocus}`;

export const linkNav =
  `inline-flex min-h-11 items-center rounded px-2 text-zinc-300 underline-offset-4 transition-colors hover:text-obs-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-obs-void`;

export const btnIcon =
  `inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-obs-border bg-obs-elevated px-3 py-1 text-sm text-zinc-200 shadow transition-colors hover:border-obs-violet active:bg-obs-surface ${btnFocus}`;
