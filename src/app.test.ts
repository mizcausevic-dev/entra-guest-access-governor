import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("app", () => {
  test("serves the full html and api surface", async () => {
    const htmlRoutes = [
      ["/", "Guest invitations, sponsor drift, and cross-tenant trust"],
      ["/guest-lane", "Guest Lane"],
      ["/access-gaps", "Access Gaps"],
      ["/review-posture", "Review Posture"],
      ["/verification", "Verification"],
      ["/docs", "npx entra-guest-access-governor"]
    ] as const;

    for (const [route, snippet] of htmlRoutes) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.text).toContain(snippet);
    }

    const apiRoutes = [
      "/api/dashboard/summary",
      "/api/guest-lane",
      "/api/access-gaps",
      "/api/review-posture",
      "/api/verification",
      "/api/sample"
    ] as const;

    for (const route of apiRoutes) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
    }

    const summary = await request(app).get("/api/dashboard/summary");
    expect(summary.body.bundles).toBe(2);
    expect(summary.body.blockingGaps).toBe(5);

    const sample = await request(app).get("/api/sample");
    expect(sample.body.sample.snapshots).toHaveLength(2);
  });
});
