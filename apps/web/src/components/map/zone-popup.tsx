import type { ZonePayload } from "@/lib/report-serializers";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";

type Props = {
  zone: ZonePayload;
  onClose: () => void;
};

export function ZonePopup({ zone, onClose }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{zone.zone}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {zone.reportCount} signalement{zone.reportCount > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4 px-5 py-4">
        {/* Molecules */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Substances</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {zone.molecules.length > 0 ? (
              zone.molecules.map((mol) => (
                <span
                  key={mol}
                  className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                >
                  {mol}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Non précisées</span>
            )}
          </div>
        </div>

        {/* Adverse effects */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Effets négatifs</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {zone.adverseEffects.length > 0 ? (
              zone.adverseEffects.map((eff) => (
                <span
                  key={eff}
                  className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                >
                  {eff}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Aucun rapporté</span>
            )}
          </div>
        </div>

        {/* Proof level */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Niveau de preuve max.</span>
          <span className="font-semibold text-slate-700">{PROOF_LEVEL_LABELS[zone.maxProofLevel]}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-[11px] leading-4 text-slate-400">
          Coordonnées volontairement approximées. L&apos;observatoire documente des zones, pas des points d&apos;accès.
        </p>
      </div>
    </section>
  );
}
