"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";
import { ObsButton } from "@/components/ui/obs";

type Props = {
  declarationId: string;
};

export function DeclarationActions({ declarationId }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [proofLevel, setProofLevel] = useState("L1_TESTIMONY");

  async function submit(action: string) {
    await fetch(`/api/moderation/declarations/${declarationId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, proofLevel }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-obs-border bg-obs-surface p-5">
      <h2 className="text-lg font-semibold text-zinc-100">Moderation actions</h2>
      <label htmlFor="decl-notes" className="obs-label mt-4 block text-zinc-300">
        Internal note / reason
      </label>
      <textarea
        id="decl-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="mt-1 w-full rounded-md border border-obs-border bg-obs-elevated p-3 text-zinc-100 placeholder:text-zinc-400"
        rows={4}
      />
      <label htmlFor="decl-proof" className="obs-label mt-3 block text-zinc-300">
        Proof level
      </label>
      <select
        id="decl-proof"
        value={proofLevel}
        onChange={(event) => setProofLevel(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-obs-border bg-obs-elevated p-3 text-zinc-100"
      >
        {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
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
        <ObsButton variant="outline" onClick={() => submit("CHANGE_PROOF_LEVEL")}>
          Change proof level
        </ObsButton>
        <ObsButton variant="outline" onClick={() => submit("CONTEST")}>
          Contest
        </ObsButton>
        <ObsButton variant="danger" onClick={() => submit("REJECT")}>
          Reject
        </ObsButton>
        <ObsButton variant="danger" onClick={() => { if (confirm("Permanently delete this declaration?")) submit("DELETE"); }}>
          Delete
        </ObsButton>
      </div>
    </div>
  );
}
