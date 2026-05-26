"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";

type Props = {
  reportId: string;
};

export function ReportActions({ reportId }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [proofLevel, setProofLevel] = useState("L1_TESTIMONY");

  async function submit(action: string) {
    await fetch(`/api/moderation/signalements/${reportId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, proofLevel }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Actions de modération</h2>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-4 w-full rounded-lg border p-3" rows={4} placeholder="Note interne ou motif" />
      <select value={proofLevel} onChange={(event) => setProofLevel(event.target.value)} className="mt-3 w-full rounded-lg border p-3">
        {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => submit("PUBLISH")} className="rounded-lg bg-slate-900 px-3 py-2 text-white">Publier</button>
        <button type="button" onClick={() => submit("PUBLISH_LIMITED")} className="rounded-lg border px-3 py-2">Publier limité</button>
        <button type="button" onClick={() => submit("REQUEST_PROOF")} className="rounded-lg border px-3 py-2">Demander preuves</button>
        <button type="button" onClick={() => submit("MASK_ADDRESS")} className="rounded-lg border px-3 py-2">Masquer adresse</button>
        <button type="button" onClick={() => submit("CHANGE_PROOF_LEVEL")} className="rounded-lg border px-3 py-2">Changer niveau preuve</button>
        <button type="button" onClick={() => submit("CONTEST")} className="rounded-lg border px-3 py-2">Contester</button>
        <button type="button" onClick={() => submit("REJECT")} className="rounded-lg bg-red-900 px-3 py-2 text-white">Rejeter</button>
        <button type="button" onClick={() => submit("ARCHIVE")} className="rounded-lg border px-3 py-2">Archiver</button>
      </div>
    </div>
  );
}
