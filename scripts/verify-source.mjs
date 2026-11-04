import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
let errors = [];
for (const file of files) {
  if (/^\.env(?!\.example$)/.test(file)) {
    errors.push("Secret env file would be tracked: " + file);
    continue;
  }
  if (/\.(png|jpg|webm|mp4|zip|gz)$/i.test(file)) continue;
  const content = readFileSync(file, "utf8");
  if (/sk-[A-Za-z0-9]{20,}|gh[oprsu]_[A-Za-z0-9]{30,}/.test(content))
    errors.push("Credential-shaped content: " + file);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  JSON.stringify({
    sourceFilesChecked: files.length,
    credentialPatternsFound: 0,
    envFilesIgnored: true,
  }),
);
