// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  accessGaps,
  guestLane,
  payload,
  reviewPosture,
  summary,
  verification
} from "./services/entraGuestAccessGovernorService.js";
import {
  renderAccessGaps,
  renderDocs,
  renderGuestLane,
  renderOverview,
  renderReviewPosture,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5524);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/guest-lane", (_req, res) => res.type("html").send(renderGuestLane()));
app.get("/access-gaps", (_req, res) => res.type("html").send(renderAccessGaps()));
app.get("/review-posture", (_req, res) => res.type("html").send(renderReviewPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/guest-lane", (_req, res) => res.json(guestLane()));
app.get("/api/access-gaps", (_req, res) => res.json(accessGaps()));
app.get("/api/review-posture", (_req, res) => res.json(reviewPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`Entra Guest Access Governor listening on http://${host}:${port}`);
  });
}

export default app;
