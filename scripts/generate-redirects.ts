#!/usr/bin/env tsx
/**
 * generate-redirects.ts
 *
 * Reads data/book-id-redirects.json and writes Cloudflare Pages redirect rules
 * to public/_redirects in the format:
 *
 *   /books/{percent-encoded-oldId}  /books/{newId}  301
 *
 * Existing non-book redirect lines in public/_redirects are preserved.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REDIRECTS_JSON = path.join(ROOT, "data", "book-id-redirects.json");
const PUBLIC_REDIRECTS = path.join(ROOT, "public", "_redirects");

function main() {
  if (!fs.existsSync(REDIRECTS_JSON)) {
    console.error(`ERROR: ${REDIRECTS_JSON} not found. Run fix-blog-book-ids.ts first.`);
    process.exit(1);
  }

  const mapping: Record<string, string> = JSON.parse(fs.readFileSync(REDIRECTS_JSON, "utf-8"));
  const entries = Object.entries(mapping);

  if (entries.length === 0) {
    console.log("No redirects to generate.");
    return;
  }

  const lines: string[] = [];
  for (const [oldId, newId] of entries) {
    // The old URL was /books/{oldId} where oldId contained Japanese chars
    // Browsers/crawlers would have accessed it percent-encoded
    const encodedOld = encodeURIComponent(oldId);
    lines.push(`/books/${encodedOld}  /books/${newId}  301`);
  }

  const content = lines.join("\n") + "\n";
  fs.writeFileSync(PUBLIC_REDIRECTS, content, "utf-8");

  console.log(`Wrote ${lines.length} redirect(s) to: ${PUBLIC_REDIRECTS}`);
  console.log("\nSample lines:");
  lines.slice(0, 5).forEach((l) => console.log(" ", l));
  if (lines.length > 5) {
    console.log(`  ... and ${lines.length - 5} more`);
  }
}

main();
