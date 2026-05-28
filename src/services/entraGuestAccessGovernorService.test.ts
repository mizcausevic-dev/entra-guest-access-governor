import { describe, expect, test } from "vitest";

import {
  accessGaps,
  guestLane,
  reviewPosture,
  summary,
  verification
} from "./entraGuestAccessGovernorService.js";

describe("entraGuestAccessGovernorService", () => {
  test("summary reflects the sample posture", () => {
    expect(summary()).toMatchObject({
      bundles: 2,
      currentBundles: 1,
      gaps: 6,
      blockingGaps: 5,
      guestRisks: 2,
      reviewRisks: 3
    });
  });

  test("guest lane stays mapped to owners", () => {
    const lanes = guestLane();
    expect(lanes).toHaveLength(4);
    expect(lanes.some((lane) => lane.lane === "Invitation governance lane" && lane.owner === "Identity Governance")).toBe(true);
  });

  test("access gaps sort high severity first", () => {
    const risks = accessGaps();
    expect(risks[0]?.severity).toBe("high");
    expect(risks.some((risk) => risk.code === "missing-access-review")).toBe(true);
  });

  test("review posture and verification stay populated", () => {
    expect(reviewPosture()).toHaveLength(4);
    expect(verification().length).toBeGreaterThan(3);
  });
});
