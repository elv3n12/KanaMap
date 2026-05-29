"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdverseEffect, MarketingClaim, Molecule } from "@prisma/client";
import {
  FORM_OF_USE_LABELS,
  PLACE_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
  PROOF_LEVEL_LABELS,
} from "@/lib/constants";
import { ObsButton } from "@/components/ui/obs";

const EUROPEAN_COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "DE", name: "Allemagne" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "LU", name: "Luxembourg" },
  { code: "NL", name: "Pays-Bas" },
  { code: "ES", name: "Espagne" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italie" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "IE", name: "Irlande" },
  { code: "AT", name: "Autriche" },
  { code: "PL", name: "Pologne" },
  { code: "CZ", name: "Tchéquie" },
  { code: "DK", name: "Danemark" },
  { code: "SE", name: "Suède" },
  { code: "NO", name: "Norvège" },
  { code: "FI", name: "Finlande" },
  { code: "GR", name: "Grèce" },
  { code: "RO", name: "Roumanie" },
  { code: "BG", name: "Bulgarie" },
  { code: "HR", name: "Croatie" },
  { code: "HU", name: "Hongrie" },
  { code: "SK", name: "Slovaquie" },
  { code: "SI", name: "Slovénie" },
  { code: "EE", name: "Estonie" },
  { code: "LV", name: "Lettonie" },
  { code: "LT", name: "Lituanie" },
  { code: "MT", name: "Malte" },
  { code: "CY", name: "Chypre" },
] as const;

type CitySuggestion = {
  name: string;
  state?: string;
  lat: number;
  lng: number;
  displayName: string;
};

type Props = {
  molecules: Molecule[];
  claims: MarketingClaim[];
  effects: AdverseEffect[];
};

export function ReportForm({ molecules, claims, effects }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const [countryCode, setCountryCode] = useState("FR");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const countryName = EUROPEAN_COUNTRIES.find((c) => c.code === countryCode)?.name ?? "";

  const fetchCities = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setCitySuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/geocode/cities?q=${encodeURIComponent(query)}&country=${countryCode}`);
        if (res.ok) {
          const data = await res.json();
          setCitySuggestions(data);
          setShowSuggestions(true);
        }
      } catch {
        setCitySuggestions([]);
      }
    },
    [countryCode],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cityQuery || selectedCity) return;
    debounceRef.current = setTimeout(() => fetchCities(cityQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [cityQuery, fetchCities, selectedCity]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCity(city: CitySuggestion) {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowSuggestions(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/signalements", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Impossible de soumettre le signalement.");
      return;
    }
    router.push("/compte?submitted=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="obs-panel space-y-8 p-5 sm:p-6">
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">{error}</p>
      )}

      {/* Step 1: Zone d'observation */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100">1. Zone d&apos;observation</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sélectionnez le pays et la ville où l&apos;observation a été faite.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="country-select" className="mb-1 block text-sm font-medium text-zinc-200">
              Pays
            </label>
            <select
              id="country-select"
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setSelectedCity(null);
                setCityQuery("");
              }}
              className="w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100"
            >
              {EUROPEAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div ref={containerRef} className="relative">
            <label htmlFor="city-input" className="mb-1 block text-sm font-medium text-zinc-200">
              Ville
            </label>
            <input
              id="city-input"
              type="text"
              required
              autoComplete="off"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setSelectedCity(null);
              }}
              onFocus={() => {
                if (citySuggestions.length > 0 && !selectedCity) setShowSuggestions(true);
              }}
              className="w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500"
              placeholder="Commencez à taper le nom de la ville..."
            />
            {showSuggestions && citySuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-obs-border bg-obs-elevated shadow-lg">
                {citySuggestions.map((city, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-obs-surface"
                      onClick={() => selectCity(city)}
                    >
                      <span className="font-medium">{city.name}</span>
                      {city.state && (
                        <span className="ml-1 text-zinc-500">({city.state})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Hidden fields for form submission */}
        <input type="hidden" name="countryCode" value={countryCode} />
        <input type="hidden" name="countryName" value={countryName} />
        <input type="hidden" name="city" value={selectedCity?.name ?? cityQuery} />
        <input type="hidden" name="centroidLat" value={selectedCity?.lat ?? ""} />
        <input type="hidden" name="centroidLng" value={selectedCity?.lng ?? ""} />
      </section>

      {/* Step 2: Produit observé */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100">2. Produit observé</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select required name="placeType" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100">
            {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input name="placeOtherLabel" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500" placeholder="Si autre, préciser" />
          <input name="brandRawName" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500" placeholder="Marque observée" />
          <input required name="productCommercialName" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500" placeholder="Nom commercial du produit" />
          <select required name="productType" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100">
            {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="formOfUse" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100">
            <option value="">Forme d&apos;administration (facultatif)</option>
            {Object.entries(FORM_OF_USE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Step 3: Molécules, allégations et effets */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100">3. Molécules, allégations et effets</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <CheckboxGroup title="Molécules annoncées" name="announcedMoleculeIds" items={molecules.map((item) => [item.id, item.name])} />
          <CheckboxGroup title="Molécules suspectées" name="suspectedMoleculeIds" items={molecules.map((item) => [item.id, item.name])} />
          <CheckboxGroup title="Allégations commerciales" name="marketingClaimIds" items={claims.map((item) => [item.id, item.label])} />
        </div>
        <div className="mt-6">
          <CheckboxGroup title="Effets indésirables rapportés" name="adverseEffectIds" items={effects.map((item) => [item.id, item.label])} columns />
        </div>
      </section>

      {/* Step 4: Niveau de preuve */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100">4. Niveau de preuve</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select name="proofLevel" className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100">
            {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input required name="observationDate" type="date" defaultValue={today} className="rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100" />
        </div>
        <textarea
          name="narrative"
          className="mt-4 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500"
          rows={5}
          placeholder="Décrire prudemment ce qui a été observé, sans données personnelles ni information facilitant l'accès au produit."
        />
      </section>

      <ObsButton variant="primary" className="w-full" type="submit">
        Soumettre le signalement
      </ObsButton>
    </form>
  );
}

function CheckboxGroup({ title, name, items, columns = false }: { title: string; name: string; items: [string, string][]; columns?: boolean }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-zinc-200">{title}</legend>
      <div className={`mt-2 grid gap-2 ${columns ? "md:grid-cols-3" : ""}`}>
        {items.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 rounded-md border border-obs-border bg-obs-surface p-2 text-sm text-zinc-300 hover:border-zinc-600">
            <input type="checkbox" name={name} value={value} className="h-4 w-4 rounded border-obs-border bg-obs-elevated text-obs-violet focus:ring-obs-violet/40" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
