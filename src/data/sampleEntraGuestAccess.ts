import type { GuestAccessExport } from "../types.js";

export const sampleEntraGuestAccessPayload: GuestAccessExport = {
  snapshots: [
    {
      id: "guest-b2b-core",
      name: "B2B collaboration tenant snapshot",
      scope: "TENANT",
      reviewStatus: "WATCH",
      snapshotStatus: "CURRENT",
      tenantPath: "/tenants/kg-prod/b2b-core",
      guestCount: 184,
      owner: "Identity Governance",
      activeReviews: 3,
      collectedAt: "2026-05-30T13:00:00Z"
    },
    {
      id: "guest-finance-suppliers",
      name: "Finance supplier guest access snapshot",
      scope: "GROUP",
      reviewStatus: "CRITICAL",
      snapshotStatus: "STALE",
      tenantPath: "/tenants/kg-prod/groups/finance-supplier-guests",
      guestCount: 42,
      owner: "Platform Operations",
      activeReviews: 1,
      collectedAt: "2026-05-26T08:30:00Z"
    }
  ],
  gaps: [
    {
      id: "gap-invite-sprawl",
      snapshotId: "guest-b2b-core",
      resourcePath: "/tenants/kg-prod/groups/external-collab/readers",
      resourceType: "SecurityGroup",
      scope: "GROUP",
      controlFamily: "Invitations",
      status: "CHANGED",
      expectedState: "Guest invitations stay sponsor-bound and routed through reviewed access paths.",
      observedState: "New guests are still being invited directly into reader groups without the expected intake gate.",
      changeWindowHours: 16,
      breaksGuardrail: true,
      impactsIdentity: true
    },
    {
      id: "gap-missing-review",
      snapshotId: "guest-finance-suppliers",
      resourcePath: "/tenants/kg-prod/reviews/finance-supplier-guests-q2",
      resourceType: "AccessReview",
      scope: "GROUP",
      controlFamily: "Reviews",
      status: "MISSING",
      expectedState: "High-risk guest groups stay covered by active access reviews before quarter-close.",
      observedState: "The quarterly review is not active and stale members still retain supplier-facing access.",
      changeWindowHours: 28,
      breaksGuardrail: true,
      impactsIdentity: true
    },
    {
      id: "gap-sponsor-drift",
      snapshotId: "guest-finance-suppliers",
      resourcePath: "/tenants/kg-prod/guests/vendor-analyst-17",
      resourceType: "GuestUser",
      scope: "GUEST_USER",
      controlFamily: "Sponsors",
      status: "CHANGED",
      expectedState: "Every guest stays mapped to an accountable sponsor before access is renewed.",
      observedState: "Sponsor ownership is missing for one active supplier guest after an internal handoff.",
      changeWindowHours: 31,
      impactsIdentity: true
    },
    {
      id: "gap-cross-tenant",
      snapshotId: "guest-b2b-core",
      resourcePath: "/tenants/kg-prod/cross-tenant/partner-research",
      resourceType: "CrossTenantAccessSetting",
      scope: "CROSS_TENANT_POLICY",
      controlFamily: "CrossTenant",
      status: "CHANGED",
      expectedState: "Cross-tenant trust remains limited to approved partner settings and reviewed claims.",
      observedState: "Inbound trust is wider than the reviewed partner baseline for one collaboration partner.",
      changeWindowHours: 14,
      breaksGuardrail: true,
      impactsIdentity: true
    },
    {
      id: "gap-inactive-guest",
      snapshotId: "guest-finance-suppliers",
      resourcePath: "/tenants/kg-prod/guests/former-contractor-8",
      resourceType: "GuestUser",
      scope: "GUEST_USER",
      controlFamily: "Inactivity",
      status: "CHANGED",
      expectedState: "Inactive guest identities are removed or disabled within the cleanup window.",
      observedState: "An inactive guest still retains access past the cleanup threshold.",
      changeWindowHours: 43,
      breaksGuardrail: true,
      impactsIdentity: true
    },
    {
      id: "gap-telemetry",
      snapshotId: "guest-b2b-core",
      resourcePath: "/tenants/kg-prod/audit/guest-signin-exports",
      resourceType: "GuestUser",
      scope: "TENANT",
      controlFamily: "Telemetry",
      status: "MISSING",
      expectedState: "Guest sign-in and invite audit exports stay complete for review and attestation.",
      observedState: "Guest audit exports are missing for the last two review cycles, weakening governance evidence.",
      changeWindowHours: 36,
      breaksGuardrail: true,
      impactsIdentity: true
    }
  ]
};

export const guestLanePackets = [
  {
    id: "invite-governance",
    lane: "Invitation governance lane",
    owner: "Identity Governance",
    focus: "Sponsor-bound invitations, intake control, and least-privilege B2B access",
    status: "red",
    note: "Direct guest invitations are still bypassing the reviewed intake path.",
    nextAction: "Route new guest invites back through the sponsor-approved access path."
  },
  {
    id: "review-hygiene",
    lane: "Access review lane",
    owner: "Platform Operations",
    focus: "Review cadence, inactive guest cleanup, and renewal decisions",
    status: "red",
    note: "One supplier-facing guest group is missing its active review and stale users still remain.",
    nextAction: "Reopen the quarterly review and prune stale guest members before renewal."
  },
  {
    id: "partner-trust",
    lane: "Cross-tenant trust lane",
    owner: "Security Operations",
    focus: "Partner trust settings, inbound claims, and collaboration posture",
    status: "yellow",
    note: "Partner trust is recoverable, but one inbound setting is still wider than the approved baseline.",
    nextAction: "Constrain inbound trust to the reviewed collaboration scope."
  },
  {
    id: "audit-continuity",
    lane: "Audit continuity lane",
    owner: "Identity Governance",
    focus: "Guest sign-in evidence, sponsor attribution, and telemetry completeness",
    status: "yellow",
    note: "Audit continuity exists, but sponsor and sign-in evidence are still partially stale.",
    nextAction: "Restore guest audit exports and close sponsor attribution gaps."
  }
] as const;

export const reviewPackets = [
  {
    packetId: "B2B-12",
    lane: "Executive collaboration guest review",
    owner: "Identity Governance",
    status: "red",
    completenessScore: 59,
    decisionNote: "Invitation sprawl and review drift mean this guest cohort is not ready for renewal sign-off.",
    blocker: "Direct invites and stale guest memberships both need containment before the next review closes.",
    launchWindowHours: 9
  },
  {
    packetId: "B2B-18",
    lane: "Supplier guest renewal",
    owner: "Platform Operations",
    status: "red",
    completenessScore: 62,
    decisionNote: "Supplier guest access can still outlive the current review window and sponsor proof is incomplete.",
    blocker: "Reactivate the review and restore sponsor ownership before extending access.",
    launchWindowHours: 12
  },
  {
    packetId: "B2B-24",
    lane: "Partner trust revalidation",
    owner: "Security Operations",
    status: "yellow",
    completenessScore: 74,
    decisionNote: "Cross-tenant posture can clear once inbound trust settings are tightened back to baseline.",
    blocker: "Partner trust settings still exceed the approved scope for one collaboration path.",
    launchWindowHours: 18
  },
  {
    packetId: "B2B-31",
    lane: "Guest audit restoration",
    owner: "Identity Governance",
    status: "yellow",
    completenessScore: 70,
    decisionNote: "Audit trust is recoverable in one cleanup cycle if the missing guest exports are restored now.",
    blocker: "Guest sign-in exports must replay before the next governance review checkpoint.",
    launchWindowHours: 24
  }
] as const;
