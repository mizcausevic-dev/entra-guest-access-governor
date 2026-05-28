// Operator surface for Entra guest access governance, sponsor drift, and cross-tenant trust.
//
// Inputs reflect exported or captured guest-governance posture:
//   - guest access snapshots
//   - gap/exception events across invitations, reviews, sponsors, trust settings, inactivity, and telemetry

export type ScopeKind = "TENANT" | "GUEST_USER" | "GROUP" | "CROSS_TENANT_POLICY" | "APP";
export type ReviewHealth = "HEALTHY" | "WATCH" | "CRITICAL";
export type SnapshotStatus = "CURRENT" | "STALE";
export type GapStatus = "ADDED" | "REMOVED" | "CHANGED" | "MISSING";
export type ControlFamily =
  | "Invitations"
  | "Reviews"
  | "Sponsors"
  | "CrossTenant"
  | "Inactivity"
  | "Apps"
  | "Telemetry";

export type ResourceType =
  | "GuestUser"
  | "AccessReview"
  | "SecurityGroup"
  | "CrossTenantAccessSetting"
  | "EnterpriseApp"
  | string;

export interface GuestSnapshot {
  id: string;
  name: string;
  scope: ScopeKind;
  reviewStatus: ReviewHealth;
  snapshotStatus: SnapshotStatus;
  tenantPath: string;
  guestCount: number;
  owner: string;
  activeReviews: number;
  collectedAt: string;
}

export interface GuestAccessGap {
  id: string;
  snapshotId: string;
  resourcePath: string;
  resourceType: ResourceType;
  scope: ScopeKind;
  controlFamily: ControlFamily;
  status: GapStatus;
  expectedState: string;
  observedState: string;
  changeWindowHours: number;
  breaksGuardrail?: boolean;
  impactsIdentity?: boolean;
  note?: string;
}

export interface GuestAccessExport {
  snapshots?: GuestSnapshot[];
  gaps?: GuestAccessGap[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-guest-snapshot"
  | "stale-guest-export"
  | "invitation-sprawl-risk"
  | "orphaned-guest-risk"
  | "missing-access-review"
  | "cross-tenant-policy-gap"
  | "inactive-guest-risk"
  | "sponsor-ownership-gap"
  | "telemetry-gap"
  | "stale-gap-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  controlFamily?: ControlFamily;
  resourceType?: ResourceType;
}

export interface PostureReport {
  generatedAt: string;
  snapshots: number;
  currentSnapshots: number;
  gaps: number;
  blockingGaps: number;
  guestRisks: number;
  reviewRisks: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface PostureOptions {
  now?: string;
  staleGapAfterHours?: number;
}
