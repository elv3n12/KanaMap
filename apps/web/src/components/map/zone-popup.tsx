import type { ZonePayload } from "@/lib/report-serializers";
import { PRODUCT_TYPE_LABELS, PROOF_LEVEL_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";

type Props = {
  zone: ZonePayload;
};

export function ZonePopup({ zone }: Props) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
      <h2 className="text-2xl font-semibold">Zone : {zone.zone}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium">Signalements</dt>
          <dd>{zone.reportCount}</dd>
        </div>
        <div>
          <dt className="font-medium">Molécules signalées</dt>
          <dd>{zone.molecules.length ? zone.molecules.join(", ") : "Non précisées"}</dd>
        </div>
        <div>
          <dt className="font-medium">Produits</dt>
          <dd>
            {zone.productTypes.length
              ? zone.productTypes.map((type) => PRODUCT_TYPE_LABELS[type as keyof typeof PRODUCT_TYPE_LABELS]).join(", ")
              : "Non précisés"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Niveau de preuve maximal</dt>
          <dd>{PROOF_LEVEL_LABELS[zone.maxProofLevel]}</dd>
        </div>
        <div>
          <dt className="font-medium">Effets rapportés</dt>
          <dd>{zone.adverseEffects.length ? zone.adverseEffects.join(", ") : "Non rapportés"}</dd>
        </div>
        <div>
          <dt className="font-medium">Statut</dt>
          <dd>{zone.statuses.map((status) => REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS]).join(", ")}</dd>
        </div>
      </dl>
      <p className="mt-5 text-xs leading-5 text-slate-600">
        Les coordonnées sont volontairement approximées. L’observatoire documente des zones de
        signalement, pas des points d’accès.
      </p>
    </section>
  );
}
