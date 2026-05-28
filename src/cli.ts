#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { GuestAccessExport } from "./types.js";

const args = process.argv.slice(2);

function usage(): never {
  console.error([
    "Usage: entra-guest-access-governor <export.json> [options]",
    "",
    "Options:",
    "  --format summary|markdown|json   Output format (default: summary)",
    "  --fail-on-high                    Exit 1 when high-severity findings exist"
  ].join("\n"));
  process.exit(1);
}

if (args.length === 0) usage();

const input = args[0];
if (input === undefined) usage();

let format: "summary" | "markdown" | "json" = "summary";
let failOnHigh = false;

for (let i = 1; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--format") {
    const next = args[i + 1];
    if (next !== "summary" && next !== "markdown" && next !== "json") usage();
    format = next;
    i += 1;
  } else if (arg === "--fail-on-high") {
    failOnHigh = true;
  } else {
    usage();
  }
}

const payload = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), input), "utf8")
) as GuestAccessExport;
const report = analyze(payload);

if (format === "markdown") {
  console.log(toMarkdown(report));
} else if (format === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(toSummary(report));
}

if (failOnHigh && report.findingsList.some((finding) => finding.severity === "high")) {
  process.exit(1);
}
