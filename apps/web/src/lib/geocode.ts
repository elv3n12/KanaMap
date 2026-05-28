type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const GEOCODE_TIMEOUT_MS = 5000;

export async function geocodeAddress(address: string) {
  const email = process.env.NOMINATIM_EMAIL;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", address);
  if (email) url.searchParams.set("email", email);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": `CannabinoidObservatoryEurope/0.1 (${email ?? "contact unavailable"})`,
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
      throw new Error("Le service de géocodage n'a pas répondu à temps. Veuillez réessayer.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error("Le service de géocodage est temporairement indisponible.");
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];

  if (!result) {
    throw new Error("Adresse introuvable. Merci de préciser la ville et le pays.");
  }

  return {
    lat: Number(result.lat),
    lng: Number(result.lon),
    address: result.display_name,
  };
}
