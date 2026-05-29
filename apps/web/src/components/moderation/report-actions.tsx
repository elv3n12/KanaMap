"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ObsButton } from "@/components/ui/obs";

type Props = {
  reportId: string;
};

export function ReportActions({ reportId }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");

  async function submit(action: string) {
    await fetch(`/api/moderation/signalements/${reportId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-obs-border bg-obs-surface p-5">
      <h2 className="text-lg font-semibold text-zinc-100">Moderation actions</h2>
      <label htmlFor="mod-notes" className="obs-label mt-4 block text-zinc-300">
        Internal note / reason
      </label>
      <textarea
        id="mod-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="mt-1 w-full rounded-md border border-obs-border bg-obs-elevated p-3 text-zinc-100 placeholder:text-zinc-400"
        rows={4}
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ObsButton variant="primary" onClick={() => submit("PUBLISH")}>
          Publish
        </ObsButton>
        <ObsButton variant="outline" onClick={() => submit("PUBLISH_LIMITED")}>
          Publish limited
        </ObsButton>
        <ObsButton variant="outline" onClick={() => submit("REQUEST_PROOF")}>
          Request proof
        </ObsButton>
        <ObsButton variant="outline" onClick={() => submit("MASK_ADDRESS")}>
          Mask address
        </ObsButton>
        <ObsButton variant="outline" onClick={() => submit("CONTEST")}>
          Contest
        </ObsButton>
        <ObsButton variant="danger" onClick={() => submit("REJECT")}>
          Reject
        </ObsButton>
        <ObsButton variant="danger" onClick={() => { if (confirm("Permanently delete this report?")) submit("DELETE"); }}>
          Delete
        </ObsButton>
      </div>
    </div>
  );
}
