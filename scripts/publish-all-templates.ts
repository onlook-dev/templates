#!/usr/bin/env bun

import { readdir } from "node:fs/promises";
import { join } from "node:path";

const apiKey = process.env.CSB_API_KEY;
if (!apiKey) {
    console.error("❌ CSB_API_KEY environment variable is required");
    console.error("Get your API key from: https://codesandbox.io/dashboard/settings");
    console.error("Then set it: export CSB_API_KEY=your_api_key");
    process.exit(1);
}

// Find all template directories (those with package.json)
const entries = await readdir(".", { withFileTypes: true });
const templates: string[] = [];

for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "scripts" && entry.name !== "node_modules") {
        try {
            await Bun.file(join(entry.name, "package.json")).text();
            templates.push(entry.name);
        } catch {
            // Skip directories without package.json
        }
    }
}

if (templates.length === 0) {
    console.log("No templates found (directories with package.json)");
    process.exit(0);
}

console.log(`🚀 Found ${templates.length} templates: ${templates.join(", ")}`);

for (const template of templates) {
    console.log(`\n📦 Publishing template: ${template}`);

    const proc = Bun.spawn([
        "bunx",
        "@codesandbox/sdk",
        "build",
        `./${template}`,
        "--vm-tier", "Nano"
    ], {
        env: { ...process.env, CSB_API_KEY: apiKey },
        stdio: ["inherit", "inherit", "inherit"]
    });

    const exitCode = await proc.exited;

    if (exitCode === 0) {
        console.log(`✅ Template '${template}' published successfully!`);
    } else {
        console.error(`❌ Failed to publish template '${template}'`);
    }
}

console.log(`\n🎉 Finished publishing all templates!`);