"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";
import { btnDestructive, btnPrimary, btnSecondary } from "@/lib/ui/button-classes";

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
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Actions de modération</h2>
      <label htmlFor="decl-notes" className="mt-4 block text-sm font-medium text-slate-800">
        Note interne ou motif
      </label>
      <textarea
        id="decl-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-slate-900"
        rows={4}
      />
      <label htmlFor="decl-proof" className="mt-3 block text-sm font-medium text-slate-800">
        Niveau de preuve
      </label>
      <select
        id="decl-proof"
        value={proofLevel}
        onChange={(event) => setProofLevel(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 p-3 text-slate-900"
      >
        {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => submit("PUBLISH")} className={btnPrimary}>
          Publier
        </button>
        <button type="button" onClick={() => submit("PUBLISH_LIMITED")} className={btnSecondary}>
          Publier limité
        </button>
        <button type="button" onClick={() => submit("REQUEST_PROOF")} className={btnSecondary}>
          Demander preuves
        </button>
        <button type="button" onClick={() => submit("CHANGE_PROOF_LEVEL")} className={btnSecondary}>
          Changer niveau preuve
        </button>
        <button type="button" onClick={() => submit("CONTEST")} className={btnSecondary}>
          Contester
        </button>
        <button type="button" onClick={() => submit("REJECT")} className={btnDestructive}>
          Rejeter
        </button>
        <button type="button" onClick={() => submit("ARCHIVE")} className={btnSecondary}>
          Archiver
        </button>
      </div>
    </div>
  );
}
