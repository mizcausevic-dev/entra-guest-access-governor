import type { GuestAccessExport, GuestSnapshot, PostureOptions, PostureReport, Finding } from "./types.js";

function isCurrent(snapshot: GuestSnapshot): boolean {
  return snapshot.snapshotStatus === "CURRENT";
}

export function analyze(payload: GuestAccessExport, options: PostureOptions = {}): PostureReport {
  const now = options.now ?? new Date().toISOString();
  const staleGapAfterHours = options.staleGapAfterHours ?? 24;
  const snapshots = payload.snapshots ?? [];
  const gaps = payload.gaps ?? [];
  const findingsList: Finding[] = [];

  const currentSnapshots = snapshots.filter(isCurrent).length;
  if (currentSnapshots === 0) {
    findingsList.push({
      code: "no-current-guest-snapshot",
      severity: "high",
      message: "No current Entra guest-access snapshot is available for governance decisions.",
      subject: "guest-snapshot-currentness"
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.snapshotStatus === "STALE") {
      findingsList.push({
        code: "stale-guest-export",
        severity: "medium",
        message: `Guest-access snapshot for "${snapshot.name}" is stale and should be regenerated before certifying B2B posture.`,
        subject: snapshot.id,
        subjectName: snapshot.tenantPath,
        scope: snapshot.scope
      });
    }
  }

  for (const gap of gaps) {
    const observed = gap.observedState.toLowerCase();
    const expected = gap.expectedState.toLowerCase();

    if (gap.controlFamily === "Invitations" && (observed.includes("invite") || observed.includes("group") || gap.breaksGuardrail)) {
      findingsList.push({
        code: "invitation-sprawl-risk",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Invitation sprawl is active on "${gap.resourcePath}" and should be contained before new B2B access is approved.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "Reviews" && (observed.includes("review") || observed.includes("stale") || gap.breaksGuardrail)) {
      findingsList.push({
        code: "missing-access-review",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Access review coverage is degraded on "${gap.resourcePath}" and stale guest access should be revalidated before the next cycle closes.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "Sponsors" && (observed.includes("sponsor") || observed.includes("owner") || gap.impactsIdentity)) {
      findingsList.push({
        code: "sponsor-ownership-gap",
        severity: "medium",
        message: `Sponsor ownership is incomplete on "${gap.resourcePath}", weakening guest accountability and renewal decisions.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "CrossTenant" && (observed.includes("trust") || observed.includes("partner") || gap.breaksGuardrail)) {
      findingsList.push({
        code: "cross-tenant-policy-gap",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Cross-tenant trust posture is degraded on "${gap.resourcePath}" and partner collaboration boundaries should be tightened.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "Inactivity" && (observed.includes("inactive") || observed.includes("cleanup") || gap.breaksGuardrail)) {
      findingsList.push({
        code: "inactive-guest-risk",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Inactive guest cleanup is delayed on "${gap.resourcePath}" and stale external identities should be removed before the next review.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "Telemetry" && (observed.includes("audit") || observed.includes("export") || expected.includes("audit"))) {
      findingsList.push({
        code: "telemetry-gap",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Guest governance telemetry is incomplete on "${gap.resourcePath}", weakening review evidence and attestation continuity.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.controlFamily === "Apps" && (observed.includes("orphan") || observed.includes("guest") || gap.impactsIdentity)) {
      findingsList.push({
        code: "orphaned-guest-risk",
        severity: gap.breaksGuardrail ? "high" : "medium",
        message: `Guest access is orphaned around "${gap.resourcePath}" and should be mapped back to a reviewed app or collaboration path.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }

    if (gap.changeWindowHours > staleGapAfterHours) {
      findingsList.push({
        code: "stale-gap-window",
        severity: gap.changeWindowHours > staleGapAfterHours * 2 ? "medium" : "low",
        message: `Gap on "${gap.resourcePath}" has remained unresolved for ${gap.changeWindowHours} hours.`,
        subject: gap.id,
        subjectName: gap.resourcePath,
        scope: gap.scope,
        controlFamily: gap.controlFamily,
        resourceType: gap.resourceType
      });
    }
  }

  const blockingGaps = gaps.filter((gap) => gap.breaksGuardrail).length;
  const guestRisks = gaps.filter((gap) => gap.controlFamily === "Invitations" || gap.controlFamily === "Inactivity" || gap.controlFamily === "Apps").length;
  const reviewRisks = gaps.filter((gap) => gap.controlFamily === "Reviews" || gap.controlFamily === "Sponsors" || gap.controlFamily === "CrossTenant").length;
  const ok = !findingsList.some((finding) => finding.severity === "high");

  return {
    generatedAt: now,
    snapshots: snapshots.length,
    currentSnapshots,
    gaps: gaps.length,
    blockingGaps,
    guestRisks,
    reviewRisks,
    findingsList,
    ok
  };
}
