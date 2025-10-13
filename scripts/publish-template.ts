#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const templateName = process.argv[2];

if (!templateName) {
    console.error("Usage: bun scripts/publish-template.ts <template-name>");
    console.error("Example: bun scripts/publish-template.ts next15");
    console.error("Example: bun scripts/publish-template.ts /absolute/path/to/template");
    process.exit(1);
}

const apiKey = process.env.CSB_API_KEY;
if (!apiKey) {
    console.error("❌ CSB_API_KEY environment variable is required");
    console.error("Get your API key from: https://codesandbox.io/dashboard/settings");
    console.error("Then set it: export CSB_API_KEY=your_api_key");
    process.exit(1);
}

// Support both absolute paths and relative template names
const templatePath = templateName.startsWith('/') ? templateName : `./${templateName}`;

// Check if template directory exists
try {
    await Bun.file(`${templatePath}/package.json`).text();
} catch {
    console.error(`❌ Template directory '${templateName}' not found or missing package.json`);
    process.exit(1);
}

console.log(`🚀 Publishing template: ${templateName}`);
console.log(`📂 Template path: ${templatePath}`);

// Get the script directory to locate resources folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resourcesPath = join(__dirname, "..", "resources");

// Copy folders from resources if they don't exist in the template
const foldersToCheck = [".codesandbox", ".devcontainer"];

for (const folder of foldersToCheck) {
    const sourcePath = join(resourcesPath, folder);
    const destPath = join(templatePath, folder);

    if (existsSync(sourcePath) && !existsSync(destPath)) {
        try {
            await cp(sourcePath, destPath, { recursive: true });
            console.log(`📋 Copied ${folder} from resources`);
        } catch (error) {
            console.warn(`⚠️  Failed to copy ${folder}: ${error}`);
        }
    }
}

// Run the CodeSandbox SDK build command
const proc = Bun.spawn([
    "bunx",
    "@codesandbox/sdk",
    "build",
    templatePath,
    "--vm-tier", "Nano"
], {
    env: { ...process.env, CSB_API_KEY: apiKey },
    stdio: ["inherit", "inherit", "inherit"]
});

const exitCode = await proc.exited;

if (exitCode === 0) {
    console.log(`✅ Template '${templateName}' published successfully!`);
    console.log(`🏷️  Use the template tag provided above to create new sandboxes`);
} else {
    console.error(`❌ Failed to publish template '${templateName}'`);
    process.exit(1);
}