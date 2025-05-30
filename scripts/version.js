import { writeFileSync } from "fs";
import { execSync } from "child_process";

function updateVersion() {
  const version = `${JSON.parse(execSync("pnpm pkg get version").toString().trim())}`;
  const [major, minor, patch] = version.split(".");
  const newContent = `MAJOR=${major}\nMINOR=${minor}\nPATCH=${patch}`;
  writeFileSync("test.txt", newContent, "utf8");
}

updateVersion();
