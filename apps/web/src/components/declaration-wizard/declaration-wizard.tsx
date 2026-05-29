"use client";

import type { LookupProps } from "./wizard-types";
import { QuickReportForm } from "./quick-report-form";

type Props = LookupProps;

export function DeclarationWizard(props: Props) {
  return <QuickReportForm {...props} />;
}
