"use client";

import { useEffect, useState } from "react";
import type { AdminCounts } from "@/lib/admin";

async function fetchCounts(): Promise<AdminCounts | null> {
  try {
    const response = await fetch("/api/admin/counts");
    if (response.ok) return response.json();
  } catch {
    // ignore network errors during polling
  }
  return null;
}

export function useAdminCounts(enabled: boolean, intervalMs = 30_000) {
  const [counts, setCounts] = useState<AdminCounts | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      const data = await fetchCounts();
      if (!cancelled && data) setCounts(data);
    }

    void load();
    const id = setInterval(() => void load(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, intervalMs]);

  return counts;
}
