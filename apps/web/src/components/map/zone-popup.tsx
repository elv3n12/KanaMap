import Link from "next/link";
import type { ZonePayload } from "@/lib/report-serializers";
import { ObsBadge, ObsButton, ObsKpi, ObsPanel } from "@/components/ui/obs";
import { severityHex, severityCount } from "@/lib/map/severity-scale";

type Props = {
  zone: ZonePayload;
  onClose: () => void;
};

export function ZonePopup({ zone, onClose }: Props) {
  const severity = severityCount(zone);

  return (
    <ObsPanel
      className="obs-glow-violet w-full max-w-[380px]"
      header={
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="obs-label text-obs-signal">Zone intel</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">{zone.zone}</h2>
            <p className="obs-data-value mt-0.5 text-xs text-obs-muted">
              {zone.countryName}
              {zone.city ? ` · ${zone.city}` : ""}
            </p>
          </div>
          <ObsButton variant="ghost" className="min-h-8 min-w-8 px-2" onClick={onClose} aria-label="Close">
            ✕
          </ObsButton>
        </div>
      }
      footer={
        <p className="text-[11px] leading-4 text-obs-muted">
          Coordinates intentionally approximated. The observatory documents zones, not access points.
        </p>
      }
    >
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <ObsKpi label="Reports" value={zone.reportCount} />
          <ObsKpi label="Severity" value={severity} />
        </div>

        <div>
          <h3 className="obs-label mb-2">Substances</h3>
          <div className="flex flex-wrap gap-1.5">
            {zone.molecules.length > 0 ? (
              zone.molecules.map((mol) => (
                <ObsBadge key={mol} tone="signal">
                  {mol}
                </ObsBadge>
              ))
            ) : (
              <span className="text-xs text-obs-muted">Not specified</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="obs-label mb-2">Adverse effects</h3>
          <div className="flex flex-wrap gap-1.5">
            {zone.adverseEffects.length > 0 ? (
              zone.adverseEffects.map((eff) => (
                <ObsBadge key={eff} tone="danger">
                  {eff}
                </ObsBadge>
              ))
            ) : (
              <span className="text-xs text-obs-muted">None reported</span>
            )}
          </div>
        </div>

        <div
          className="h-1 rounded-full"
          style={{ background: severityHex(severity), opacity: 0.85 }}
          aria-hidden
        />

        {zone.ownReportIds.length === 1 ? (
          <div className="border-t border-obs-border pt-3">
            <Link
              href={`/reports/${zone.ownReportIds[0]}/edit`}
              className="inline-flex min-h-9 w-full items-center justify-center rounded border border-obs-border bg-obs-elevated px-3 py-2 text-sm font-medium text-obs-signal transition hover:border-obs-violet hover:text-white"
            >
              Modify my report
            </Link>
          </div>
        ) : zone.ownReportIds.length > 1 ? (
          <div className="border-t border-obs-border pt-3">
            <Link
              href="/account"
              className="inline-flex min-h-9 w-full items-center justify-center rounded border border-obs-border bg-obs-elevated px-3 py-2 text-sm font-medium text-obs-signal transition hover:border-obs-violet hover:text-white"
            >
              Modify my reports ({zone.ownReportIds.length})
            </Link>
          </div>
        ) : null}
      </div>
    </ObsPanel>
  );
}
