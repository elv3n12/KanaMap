import Link from "next/link";
import { DRUGS_INFO_SERVICE_PHONE } from "@/lib/constants";

export function RiskBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-[1000] w-[min(92vw,420px)] rounded-xl border border-red-800/60 bg-red-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-sm">
      <p className="text-left text-xs font-medium leading-relaxed">
        Les cannabinoïdes synthétiques sont strictement interdits en France.
        <br className="hidden sm:inline" />{" "}
        Les cannabinoïdes semi-synthétiques sont des molécules sur lesquelles la communauté
        scientifique a très peu de recul. Pour en savoir plus, consultez la page{" "}
        <Link href="/comprendre" className="font-semibold underline underline-offset-2">
          Comprendre
        </Link>
        .
      </p>
      <p className="mt-1.5 text-left text-xs leading-relaxed text-red-200">
        Soyez prudent face aux risques d&apos;accoutumance.{" "}
        <a
          className="font-semibold text-white underline underline-offset-2"
          href={`tel:${DRUGS_INFO_SERVICE_PHONE.replaceAll(" ", "")}`}
        >
          Drogues Info Service : {DRUGS_INFO_SERVICE_PHONE}
        </a>
      </p>
    </div>
  );
}
