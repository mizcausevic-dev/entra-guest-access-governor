import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { GuestAccessExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): GuestAccessExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as GuestAccessExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts snapshots and gaps", () => {
    const report = analyze(fixture("entra-guest-hotspots.json"), { now: NOW });
    expect(report.snapshots).toBe(2);
    expect(report.gaps).toBe(6);
  });

  it("flags stale snapshot exports", () => {
    const report = analyze(fixture("entra-guest-hotspots.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "stale-guest-export")?.subjectName).toContain("finance-supplier-guests");
  });

  it("flags invitation sprawl and cross-tenant drift as high", () => {
    const report = analyze(fixture("entra-guest-hotspots.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "invitation-sprawl-risk")?.subjectName).toContain("external-collab");
    expect(report.findingsList.find((finding) => finding.code === "cross-tenant-policy-gap")?.subjectName).toContain("partner-research");
  });

  it("flags review, inactivity, and telemetry gaps", () => {
    const report = analyze(fixture("entra-guest-hotspots.json"), { now: NOW, staleGapAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "missing-access-review")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "inactive-guest-risk")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeDefined();
  });

  it("reports ok=true on a clean fixture", () => {
    const report = analyze(fixture("entra-guest-healthy.json"), { now: NOW });
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("flags when no current snapshot exists", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "guest-stale-only",
            name: "Stale-only snapshot",
            scope: "TENANT",
            reviewStatus: "WATCH",
            snapshotStatus: "STALE",
            tenantPath: "/tenants/kg-prod/stale-only",
            guestCount: 12,
            owner: "Identity Governance",
            activeReviews: 0,
            collectedAt: "2026-05-24T14:00:00Z"
          }
        ],
        gaps: []
      },
      { now: NOW }
    );

    expect(report.findingsList.find((finding) => finding.code === "no-current-guest-snapshot")).toBeDefined();
  });

  it("flags orphaned guest app lanes and low stale windows", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "guest-apps",
            name: "Apps snapshot",
            scope: "APP",
            reviewStatus: "WATCH",
            snapshotStatus: "CURRENT",
            tenantPath: "/tenants/kg-prod/apps",
            guestCount: 8,
            owner: "Platform Operations",
            activeReviews: 1,
            collectedAt: "2026-05-30T14:00:00Z"
          }
        ],
        gaps: [
          {
            id: "gap-app-orphan",
            snapshotId: "guest-apps",
            resourcePath: "/tenants/kg-prod/apps/partner-portal",
            resourceType: "EnterpriseApp",
            scope: "APP",
            controlFamily: "Apps",
            status: "ADDED",
            expectedState: "Guest app access remains mapped to reviewed collaboration paths.",
            observedState: "An orphan guest app path is active without the expected owner mapping.",
            changeWindowHours: 25,
            impactsIdentity: true
          }
        ]
      },
      { now: NOW, staleGapAfterHours: 24 }
    );

    expect(report.findingsList.find((finding) => finding.code === "orphaned-guest-risk")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "stale-gap-window")?.severity).toBe("low");
  });
});

describe("formatters", () => {
  it("toMarkdown lists findings", () => {
    const markdown = toMarkdown(analyze(fixture("entra-guest-hotspots.json"), { now: NOW }));
    expect(markdown).toContain("Entra guest governance posture");
    expect(markdown).toContain("missing-access-review");
  });

  it("toSummary emits the compact one-liner", () => {
    const summary = toSummary(analyze(fixture("entra-guest-hotspots.json"), { now: NOW }));
    expect(summary).toMatch(/^2 snapshots · 6 gaps/);
  });
});
