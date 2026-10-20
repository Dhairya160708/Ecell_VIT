import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const prettier = require.resolve("prettier/bin/prettier.cjs");
const included = /\.(?:[cm]?[jt]sx?|json|md|ya?ml)$/i;
const files = new Set();

function collect(args) {
  try {
    const output = execFileSync("git", args, { encoding: "utf8" });
    for (const file of output.split(/\r?\n/)) {
      if (included.test(file)) files.add(file);
    }
  } catch (error) {
    if (error.status !== 128) throw error;
  }
}

collect(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]);
collect(["ls-files", "--others", "--exclude-standard"]);

const base = process.env.FORMAT_BASE;
if (base && !/^0+$/.test(base)) collect(["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`]);

if (files.size === 0) {
  console.log("No changed files need formatting checks.");
  process.exit(0);
}

const result = spawnSync(process.execPath, [prettier, "--check", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
