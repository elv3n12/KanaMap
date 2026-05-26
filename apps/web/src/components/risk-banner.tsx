import { DRUGS_INFO_SERVICE_PHONE } from "@/lib/constants";

export function RiskBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] flex min-h-16 items-center justify-center border-t border-red-950 bg-red-900 px-4 py-3 text-center text-sm font-medium text-white shadow-2xl">
      Les cannabinoïdes synthétiques sont strictement interdits en France. Les cannabinoïdes
      semi-synthétiques sont des molécules sur lesquelles la communauté scientifique a très peu de
      recul. Soyez prudent et attentif aux risques d&apos;accoutumance. Pour tout problème
      d&apos;addiction, appelez Drogues Info Service au{" "}
      <a className="ml-1 underline" href={`tel:${DRUGS_INFO_SERVICE_PHONE.replaceAll(" ", "")}`}>
        {DRUGS_INFO_SERVICE_PHONE}
      </a>
      .
    </div>
  );
}
