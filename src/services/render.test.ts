// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  renderAccessGaps,
  renderDocs,
  renderGuestLane,
  renderOverview,
  renderReviewPosture,
  renderSample,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview carries the Entra guest framing", () => {
    expect(renderOverview()).toContain("Guest invitations, sponsor drift, and cross-tenant trust");
  });

  test("detail pages expose their lane names", () => {
    expect(renderGuestLane()).toContain("Guest Lane");
    expect(renderAccessGaps()).toContain("Access Gaps");
    expect(renderReviewPosture()).toContain("Review Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline Entra guest analysis");
  });

  test("sample renderer exposes the payload json", () => {
    expect(renderSample()).toContain("\"guestLane\"");
    expect(renderSample()).toContain("\"sample\"");
  });
});
