// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { guestLanePackets, reviewPackets, sampleEntraGuestAccessPayload } from "../data/sampleEntraGuestAccess.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(sampleEntraGuestAccessPayload, {
  now: NOW,
  staleGapAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high" ? 0 : finding.severity === "medium" ? 1 : finding.severity === "low" ? 2 : 3;
}

export function summary() {
  return {
    bundles: report.snapshots,
    currentBundles: report.currentSnapshots,
    gaps: report.gaps,
    blockingGaps: report.blockingGaps,
    guestRisks: report.guestRisks,
    reviewRisks: report.reviewRisks,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Tighten guest invitation flow, restore access reviews, repair sponsor attribution, and narrow cross-tenant trust before the next B2B governance checkpoint."
  };
}

export function guestLane() {
  return guestLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "invite-governance") {
        return finding.code === "invitation-sprawl-risk" || finding.code === "orphaned-guest-risk";
      }
      if (lane.id === "review-hygiene") {
        return finding.code === "missing-access-review" || finding.code === "inactive-guest-risk" || finding.code === "stale-guest-export";
      }
      if (lane.id === "partner-trust") {
        return finding.code === "cross-tenant-policy-gap";
      }
      if (lane.id === "audit-continuity") {
        return finding.code === "sponsor-ownership-gap" || finding.code === "telemetry-gap" || finding.code === "stale-gap-window";
      }
      return false;
    }).length
  }));
}

export function accessGaps() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "invitation-sprawl-risk"
          ? "Identity Governance"
          : finding.code === "missing-access-review" || finding.code === "inactive-guest-risk"
            ? "Platform Operations"
            : finding.code === "cross-tenant-policy-gap"
              ? "Security Operations"
              : "Identity Governance"
    }));
}

export function reviewPosture() {
  return reviewPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Guest snapshots, sponsor packets, and review drifts are synthetic sample data only; no live identities, invite emails, or tenant secrets are published.",
    "The control plane keeps invitation governance, access reviews, sponsor ownership, cross-tenant trust, and guest cleanup visible for operators and reviewers.",
    "This surface demonstrates Entra guest access governance, not a generic cloud or M365 keyword page.",
    "It complements Conditional Access, Intune, and broader Entra admin proof with a concrete B2B guest lifecycle lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    guestLane: guestLane(),
    accessGaps: accessGaps(),
    reviewPosture: reviewPosture(),
    verification: verification(),
    sample: sampleEntraGuestAccessPayload
  };
}
