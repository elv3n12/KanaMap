import type { ModerationActionType, ReportStatus } from "@prisma/client";

export const moderatorRoles = new Set(["MODERATOR", "ADMIN"]);

export function canModerate(role?: string | null) {
  return !!role && moderatorRoles.has(role);
}

export function actionToStatus(action: ModerationActionType): ReportStatus | null {
  switch (action) {
    case "PUBLISH":
      return "PUBLISHED";
    case "PUBLISH_LIMITED":
      return "PUBLISHED_LIMITED";
    case "REJECT":
      return "REJECTED";
    case "ARCHIVE":
      return "ARCHIVED";
    case "CONTEST":
      return "CONTESTED";
    case "REQUEST_PROOF":
      return "PENDING_REVIEW";
    default:
      return null;
  }
}

export function publicStatuses(): ReportStatus[] {
  return ["PUBLISHED", "PUBLISHED_LIMITED", "CONTESTED"];
}
