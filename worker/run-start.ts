import type { SubstrateTransitionConfirmation } from "../shared/types";

export type SubstrateTransitionFacts = {
  sampleUpdatedAt: string;
  previousStateHash: string | null;
  templateInitialStateHash: string | null;
  latestRunId: string | null;
  currentPlanRevisionId?: string;
};

export function validateSubstrateTransition(
  confirmation: SubstrateTransitionConfirmation | undefined,
  facts: SubstrateTransitionFacts,
): {
  ok: true;
  initialStateHash: string;
} | {
  ok: false;
  reason: "confirmation_required" | "template_initial_state_missing" | "stale_confirmation";
} {
  if (!facts.templateInitialStateHash) return { ok: false, reason: "template_initial_state_missing" };
  if (!confirmation || confirmation.confirmed !== true) return { ok: false, reason: "confirmation_required" };
  if (confirmation.expectedSampleUpdatedAt !== facts.sampleUpdatedAt
    || confirmation.expectedPreviousStateHash !== facts.previousStateHash
    || confirmation.expectedTemplateInitialStateHash !== facts.templateInitialStateHash
    || confirmation.expectedLatestRunId !== facts.latestRunId
    || (facts.currentPlanRevisionId !== undefined
      && confirmation.expectedCurrentPlanRevisionId !== facts.currentPlanRevisionId)) {
    return { ok: false, reason: "stale_confirmation" };
  }
  return { ok: true, initialStateHash: facts.templateInitialStateHash };
}
