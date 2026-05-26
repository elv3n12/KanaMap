import "dotenv/config";
import cron from "node-cron";
import { sendModerationSummary } from "./jobs/moderation-summary.js";

async function runSummary() {
  try {
    const result = await sendModerationSummary();
    console.info("[worker] Résumé modération envoyé", result);
  } catch (error) {
    console.error("[worker] Erreur résumé modération", error);
  }
}

console.info("[worker] Cannabinoid Observatory Europe worker started");
cron.schedule("0 9 * * *", runSummary);
void runSummary();
