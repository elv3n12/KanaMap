import Link from "next/link";
import { DRUGS_INFO_SERVICE_PHONE } from "@/lib/constants";

export function RiskBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-[1000] w-[min(92vw,420px)] rounded-xl border border-red-800/60 bg-red-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-sm">
      <p className="text-left text-xs font-medium leading-relaxed">
        Synthetic cannabinoids are strictly prohibited in France.
        <br className="hidden sm:inline" />{" "}
        Semi-synthetic cannabinoids are molecules on which the scientific community
        has very limited data. Learn more on the{" "}
        <Link href="/understand" className="font-semibold underline underline-offset-2">
          Understand
        </Link>{" "}
        page.
      </p>
      <p className="mt-1.5 text-left text-xs leading-relaxed text-red-200">
        Be cautious about addiction risks.{" "}
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
