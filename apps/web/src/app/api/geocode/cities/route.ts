import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const countryCode = searchParams.get("country")?.trim().toLowerCase();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const email = process.env.NOMINATIM_EMAIL;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("featuretype", "city");
  url.searchParams.set("q", query);
  if (countryCode) url.searchParams.set("countrycodes", countryCode);
  if (email) url.searchParams.set("email", email);

  const response = await fetch(url, {
    headers: {
      "User-Agent": `CannabinoidObservatoryEurope/0.1 (${email ?? "contact unavailable"})`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json([], { status: 502 });
  }

  const results = (await response.json()) as NominatimResult[];

  const cities = results.map((r) => ({
    name: r.address.city || r.address.town || r.address.village || r.address.municipality || r.display_name.split(",")[0],
    state: r.address.state,
    lat: Number(r.lat),
    lng: Number(r.lon),
    displayName: r.display_name,
  }));

  return NextResponse.json(cities);
}
