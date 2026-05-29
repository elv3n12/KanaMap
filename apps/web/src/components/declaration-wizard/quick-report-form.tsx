"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EUROPEAN_COUNTRIES,
  FORM_OF_USE_LABELS,
  PLACE_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
} from "@/lib/constants";
import { ObsButton } from "@/components/ui/obs";
import { MoleculeAutocomplete } from "@/components/ui/molecule-autocomplete";
import { TagPicker } from "@/components/ui/tag-picker";
import type { CitySuggestion, DeclarationData, LookupProps } from "./wizard-types";
import { WIZARD_DRAFT_KEY, defaultDeclarationData } from "./wizard-types";
import { FieldLabel, SelectInput, TextInput, YesNoChoice } from "./wizard-ui";

type Props = LookupProps & {
  reportId?: string;
  initialData?: DeclarationData;
  mode?: "create" | "edit";
};

function toPayload(data: DeclarationData) {
  const announced = data.primaryMoleculeId ? [data.primaryMoleculeId] : [];
  const announcedNames =
    !data.primaryMoleculeId && data.primaryMoleculeCustom?.trim()
      ? [data.primaryMoleculeCustom.trim()]
      : [];

  const productName =
    data.productCommercialName.trim() ||
    data.primaryMoleculeCustom?.trim() ||
    announcedNames[0] ||
    "Observed product";

  return {
    countryCode: data.countryCode,
    countryName: data.countryName,
    city: data.city,
    displayZone: data.displayZone,
    centroidLat: data.centroidLat,
    centroidLng: data.centroidLng,
    placeType: data.placeType,
    placeOtherLabel: data.placeOtherLabel,
    productCommercialName: productName,
    productType: data.productType,
    observationDate: data.observationDate,
    announcedMoleculeIds: announced,
    suspectedMoleculeIds: [] as string[],
    announcedMoleculeNames: announcedNames,
    suspectedMoleculeNames: [] as string[],
    marketingClaimIds: [] as string[],
    bought: data.consumed === true,
    consumed: data.consumed === true,
    formOfUse: data.consumed ? data.formOfUse : undefined,
    positiveEffectIds: data.positiveEffectIds,
    adverseEffectIds: data.adverseEffectIds,
    wantsContact: false,
  };
}

function toUpdatePayload(data: DeclarationData) {
  const consumed = data.consumed === true;
  return {
    productCommercialName: data.productCommercialName.trim() || undefined,
    placeType: data.placeType,
    placeOtherLabel: data.placeOtherLabel ?? null,
    productType: data.productType,
    consumed,
    formOfUse: consumed ? (data.formOfUse ?? null) : null,
    positiveEffectIds: consumed ? data.positiveEffectIds : [],
    adverseEffectIds: consumed ? data.adverseEffectIds : [],
  };
}

export function QuickReportForm({
  molecules,
  adverseEffects,
  positiveEffects,
  reportId,
  initialData,
  mode = "create",
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit" && !!reportId;

  const [data, setData] = useState<DeclarationData>(() => {
    if (initialData) return initialData;
    if (typeof window === "undefined") return defaultDeclarationData();
    try {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_KEY);
      if (raw) return { ...defaultDeclarationData(), ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return defaultDeclarationData();
  });

  const [advancedOpen, setAdvancedOpen] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [done, setDone] = useState(false);

  const [cityQuery, setCityQuery] = useState(data.city);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const patch = useCallback((partial: Partial<DeclarationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setError("");
  }, []);

  useEffect(() => {
    if (isEdit) return;
    try {
      sessionStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, isEdit]);

  const fetchCities = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(
        `/api/geocode/cities?q=${encodeURIComponent(query)}&country=${data.countryCode}`,
      );
      if (res.ok) {
        setSuggestions(await res.json());
        setShowSuggestions(true);
      }
    },
    [data.countryCode],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cityQuery || (data.city === cityQuery && data.centroidLat)) return;
    debounceRef.current = setTimeout(() => void fetchCities(cityQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [cityQuery, data.city, data.centroidLat, fetchCities]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pickCity(city: CitySuggestion) {
    setCityQuery(city.name);
    patch({
      city: city.name,
      centroidLat: city.lat,
      centroidLng: city.lng,
      displayZone: city.displayName,
    });
    setShowSuggestions(false);
  }

  function validate(): string | null {
    if (!data.city.trim()) return "Please enter a city or postcode.";
    if (data.centroidLat == null) return "Please select a city from the suggested list.";
    if (!data.primaryMoleculeId && !data.primaryMoleculeCustom?.trim()) {
      return "Please enter the substance name.";
    }
    if (!isEdit && !data.goodFaithConfirmed) {
      return "Please confirm your declaration before submitting.";
    }
    if (advancedOpen && data.consumed === true && !data.formOfUse) {
      return "Please indicate the method of consumption.";
    }
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = isEdit ? toUpdatePayload(data) : toPayload(data);
      const url = isEdit ? `/api/reports/${reportId}` : "/api/reports";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Error submitting report.");
        setSubmitting(false);
        return;
      }

      if (!isEdit) sessionStorage.removeItem(WIZARD_DRAFT_KEY);
      if (isEdit) {
        router.push("/map");
        router.refresh();
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReport() {
    if (!reportId) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Error deleting report.");
        setDeleting(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  if (done) {
    return (
      <div className="obs-panel p-5 sm:p-6">
        <h1 className="text-xl font-semibold text-zinc-100">Report submitted</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Your observation has been recorded. It will enter the observatory&apos;s moderation process.
          Thank you for your contribution.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/map"
            className="inline-flex min-h-9 items-center justify-center rounded border border-violet-600/50 bg-obs-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Back to map
          </Link>
          <Link href="/account" className="text-center text-sm text-obs-signal underline">
            My reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="obs-panel space-y-6 p-5 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100 sm:text-2xl">
          {isEdit ? "Complete your report" : "Report a point of sale"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {isEdit
            ? "Add optional details to enrich your observation on the map."
            : "Enter the city and substance to document a sale. You can add more details if you wish."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <SelectInput
            id="country"
            value={data.countryCode}
            disabled={isEdit}
            onChange={(e) => {
              const country = EUROPEAN_COUNTRIES.find((c) => c.code === e.target.value);
              patch({
                countryCode: e.target.value,
                countryName: country?.name ?? "",
                city: "",
                centroidLat: undefined,
                centroidLng: undefined,
              });
              setCityQuery("");
            }}
          >
            {EUROPEAN_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        </div>

        <div ref={containerRef} className="relative">
          <FieldLabel htmlFor="city">City / Postcode</FieldLabel>
          <TextInput
            id="city"
            value={cityQuery}
            disabled={isEdit}
            onChange={(e) => {
              setCityQuery(e.target.value);
              patch({ city: e.target.value, centroidLat: undefined, centroidLng: undefined });
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Start typing city or postcode…"
            autoComplete="off"
            required
          />
          {showSuggestions && suggestions.length > 0 ? (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-obs-border bg-obs-elevated shadow-lg">
              {suggestions.map((s) => (
                <li key={`${s.name}-${s.lat}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-obs-surface"
                    onClick={() => pickCity(s)}
                  >
                    {s.name}
                    {s.postcode ? ` (${s.postcode})` : ""}
                    {s.state ? ` — ${s.state}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <MoleculeAutocomplete
            id="substance"
            label="Substance name"
            options={molecules.map((m) => ({ id: m.id, name: m.name }))}
            selectedIds={data.primaryMoleculeId ? [data.primaryMoleculeId] : []}
            selectedCustomNames={data.primaryMoleculeCustom ? [data.primaryMoleculeCustom] : []}
            onChange={({ ids, customNames }) =>
              patch({
                primaryMoleculeId: ids[0] || undefined,
                primaryMoleculeCustom: ids.length ? undefined : (customNames[0] ?? undefined),
              })
            }
            singleSelect
            placeholder="Search or type a substance…"
          />
        </div>
      </div>

      {advancedOpen ? (
        <div className="space-y-5 border-t border-obs-border pt-5">
          <p className="obs-label text-obs-signal">Advanced report</p>

          <div>
            <FieldLabel htmlFor="commercialName">Commercial name</FieldLabel>
            <TextInput
              id="commercialName"
              value={data.productCommercialName}
              onChange={(e) => patch({ productCommercialName: e.target.value })}
              placeholder="Brand or product name (optional)"
            />
          </div>

          <div>
            <FieldLabel htmlFor="placeType">Point of sale type</FieldLabel>
            <SelectInput
              id="placeType"
              value={data.placeType}
              onChange={(e) =>
                patch({ placeType: e.target.value as DeclarationData["placeType"] })
              }
            >
              {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </div>

          {data.placeType === "OTHER" ? (
            <div>
              <FieldLabel htmlFor="placeOther">Please specify</FieldLabel>
              <TextInput
                id="placeOther"
                value={data.placeOtherLabel ?? ""}
                onChange={(e) => patch({ placeOtherLabel: e.target.value })}
              />
            </div>
          ) : null}

          <div>
            <FieldLabel htmlFor="productType">Product type</FieldLabel>
            <SelectInput
              id="productType"
              value={data.productType}
              onChange={(e) =>
                patch({ productType: e.target.value as DeclarationData["productType"] })
              }
            >
              {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <FieldLabel>Have you consumed it?</FieldLabel>
            <YesNoChoice
              value={data.consumed}
              onChange={(consumed) =>
                patch({
                  consumed,
                  formOfUse: consumed ? data.formOfUse : undefined,
                  positiveEffectIds: consumed ? data.positiveEffectIds : [],
                  adverseEffectIds: consumed ? data.adverseEffectIds : [],
                })
              }
            />
          </div>

          {data.consumed === true ? (
            <div className="space-y-5 rounded-lg border border-obs-border bg-obs-surface/50 p-4">
              <div>
                <FieldLabel htmlFor="formOfUse">Method of consumption</FieldLabel>
                <SelectInput
                  id="formOfUse"
                  value={data.formOfUse ?? ""}
                  onChange={(e) =>
                    patch({ formOfUse: e.target.value as DeclarationData["formOfUse"] })
                  }
                >
                  <option value="">Choose</option>
                  {Object.entries(FORM_OF_USE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <TagPicker
                id="positive-effects"
                label="Positive effects"
                addLabel="Add positive effect"
                options={positiveEffects.map((e) => ({ id: e.id, label: e.label }))}
                selectedIds={data.positiveEffectIds}
                onChange={(positiveEffectIds) => patch({ positiveEffectIds })}
              />

              <TagPicker
                id="negative-effects"
                label="Negative effects"
                addLabel="Add negative effect"
                options={adverseEffects.map((e) => ({ id: e.id, label: e.label }))}
                selectedIds={data.adverseEffectIds}
                onChange={(adverseEffectIds) => patch({ adverseEffectIds })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {!isEdit ? (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-obs-border bg-obs-surface px-4 py-3">
          <input
            type="checkbox"
            checked={data.goodFaithConfirmed}
            onChange={(e) => patch({ goodFaithConfirmed: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-obs-border bg-obs-elevated text-obs-violet focus:ring-obs-violet/40"
          />
          <span className="text-sm leading-6 text-zinc-200">
            By submitting, I declare in good faith that I have found a point of sale of the declared
            product.
          </span>
        </label>
      ) : null}

      {error ? (
        <p
          className="rounded-md border border-red-500/30 bg-red-950/50 p-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {!advancedOpen ? (
          <button
            type="button"
            className="text-sm text-obs-signal underline hover:text-obs-violet"
            onClick={() => setAdvancedOpen(true)}
          >
            Advanced report
          </button>
        ) : (
          <button
            type="button"
            className="text-sm text-zinc-400 underline hover:text-zinc-200"
            onClick={() => setAdvancedOpen(false)}
          >
            Hide advanced options
          </button>
        )}

        <ObsButton
          variant="primary"
          type="button"
          className="ml-auto min-h-11 px-6"
          onClick={() => void submit()}
          disabled={submitting || deleting}
        >
          {submitting
            ? isEdit
              ? "Saving…"
              : "Submitting…"
            : isEdit
              ? "Save changes"
              : "Submit report"}
        </ObsButton>
      </div>

      {isEdit ? (
        <div className="border-t border-obs-border pt-4">
          {!confirmDelete ? (
            <button
              type="button"
              className="text-sm text-red-400 underline hover:text-red-300"
              onClick={() => setConfirmDelete(true)}
            >
              Delete this report
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-300">Are you sure?</span>
              <button
                type="button"
                className="rounded border border-red-500/40 bg-red-950/50 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-900/50"
                onClick={() => void deleteReport()}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                className="text-sm text-zinc-400 underline hover:text-zinc-200"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
