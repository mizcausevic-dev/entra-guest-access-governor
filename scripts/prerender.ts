import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  accessGaps,
  guestLane,
  payload,
  reviewPosture,
  summary,
  verification
} from "../src/services/entraGuestAccessGovernorService.js";
import {
  renderAccessGaps,
  renderDocs,
  renderGuestLane,
  renderOverview,
  renderReviewPosture,
  renderVerification
} from "../src/services/render.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const site = path.join(root, "site");

mkdirSync(site, { recursive: true });

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("guest-lane", "index.html")]: renderGuestLane(),
  [path.join("access-gaps", "index.html")]: renderAccessGaps(),
  [path.join("review-posture", "index.html")]: renderReviewPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs()
};

for (const [relative, html] of Object.entries(pages)) {
  const target = path.join(site, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
}

const apis: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "guest-lane.json")]: guestLane(),
  [path.join("api", "access-gaps.json")]: accessGaps(),
  [path.join("api", "review-posture.json")]: reviewPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relative, data] of Object.entries(apis)) {
  const target = path.join(site, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(data, null, 2));
}

writeFileSync(
  path.join(site, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://guest.kineticgain.com/sitemap.xml\n"
);
writeFileSync(
  path.join(site, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://guest.kineticgain.com/</loc></url>
  <url><loc>https://guest.kineticgain.com/guest-lane/</loc></url>
  <url><loc>https://guest.kineticgain.com/access-gaps/</loc></url>
  <url><loc>https://guest.kineticgain.com/review-posture/</loc></url>
  <url><loc>https://guest.kineticgain.com/verification/</loc></url>
  <url><loc>https://guest.kineticgain.com/docs/</loc></url>
</urlset>`
);

const cname = path.join(root, "CNAME");
if (existsSync(cname)) {
  copyFileSync(cname, path.join(site, "CNAME"));
}
