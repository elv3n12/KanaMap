/** Shared Tailwind classes for interactive controls (WCAG AAA focus + hover/active). */

export const btnFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transition-none";

export const btnPrimary =
  `inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-800 ${btnFocus}`;

export const btnPrimaryBlack =
  `inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800 active:bg-gray-900 ${btnFocus}`;

export const btnSecondary =
  `inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors hover:bg-slate-50 active:bg-slate-100 ${btnFocus}`;

export const btnDestructive =
  `inline-flex min-h-11 items-center justify-center rounded-lg bg-red-900 px-3 py-2 text-white transition-colors hover:bg-red-700 active:bg-red-800 ${btnFocus}`;

export const btnNavPill =
  `inline-flex min-h-11 items-center rounded-full bg-slate-900 px-3 py-1.5 text-white transition-colors hover:bg-slate-700 active:bg-slate-800 ${btnFocus}`;

export const btnNavPillBlack =
  `inline-flex min-h-11 items-center rounded-full bg-black px-3 py-1.5 text-white transition-colors hover:bg-gray-800 active:bg-gray-900 ${btnFocus}`;

export const btnGhost =
  `inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-slate-900 underline-offset-4 transition-colors hover:bg-slate-100 hover:underline active:bg-slate-200 ${btnFocus}`;

export const linkNav =
  `inline-flex min-h-11 items-center rounded px-2 text-slate-900 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`;

export const btnIcon =
  `inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white px-3 py-1 text-sm text-slate-900 shadow transition-colors hover:bg-slate-50 active:bg-slate-100 ${btnFocus}`;
