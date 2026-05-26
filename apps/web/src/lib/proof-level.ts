import type { ProofLevel } from "@prisma/client";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";

const rank: Record<ProofLevel, number> = {
  L1_TESTIMONY: 1,
  L2_VISUAL: 2,
  L3_COMMERCIAL_DOC: 3,
  L4_LAB_ANALYSIS: 4,
  L5_SANITARY_SIGNAL: 5,
};

export function maxProofLevel(levels: ProofLevel[]) {
  return levels.reduce<ProofLevel>(
    (max, level) => (rank[level] > rank[max] ? level : max),
    "L1_TESTIMONY",
  );
}

export function proofLabel(level: ProofLevel) {
  return PROOF_LEVEL_LABELS[level];
}

export function proofRank(level: ProofLevel) {
  return rank[level];
}
