import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "child_process";

const releaseNotesPath = "release-notes.md";

function extractChangelogContent(filePath) {
  const changelog = readFileSync(filePath, "utf-8");
  const lines = changelog.split(/\r?\n/); // Split by line endings for different OS
  let content = "";
  let capture = false;

  for (const line of lines) {
    let firstCapture = false;
    if (line.startsWith("## ")) {
      if (capture) break; // Stop capturing if another "## " is found
      capture = true; // Start capturing
      firstCapture = true;
    }

    if (!firstCapture && capture) {
      content += line + "\n"; // Add the line to the content
    }
  }

  return content.trim().replaceAll("###", "##"); // Remove trailing whitespace
}

function publishRelease() {
  const content = extractChangelogContent("CHANGELOG.md");

  writeFileSync(releaseNotesPath, content);

  const version = `v${JSON.parse(execSync("pnpm pkg get version").toString().trim())}`;
  console.log(`Found version:`, version);

  const releases = JSON.parse(
    execSync("gh release list --json name --limit 5").toString().trim(),
  );
  console.log(`Found releases:`, releases);

  const releaseFound = releases.some((release) => release.name === version);

  if (releaseFound) {
    console.log("Release exists, skip publish");
  } else {
    console.log("Release not found, creating it");
    const releaseCommand = `gh release create "${version}" --target main --title "${version}" --notes-file "${releaseNotesPath}"`;
    if (process.env.CI) {
      console.log(execSync(releaseCommand).toString());
    } else {
      console.log(
        "process.env.CI not set would run command:\n",
        releaseCommand,
        "\n\nContent for changelog:\n",
        content,
      );
    }
  }
}

publishRelease();
