import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Parses .env.example file content into structured env variable objects
function parseEnvFile(fileContent: string) {
  const lines = fileContent.split("\n");
  const variables = [];

  let previousLine = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Store comment to use as description
    if (line.startsWith("#")) {
      previousLine = line;
      continue;
    }

    const [key, ...rest] = line.split("=");
    const placeholder = rest.join("=").trim().replace(/^"|"$/g, "");

    variables.push({
      key: key.trim(),
      description: previousLine.startsWith("#")
        ? previousLine.slice(1).trim()
        : "",
      required: true,
      placeholder,
      example: placeholder,
    });

    previousLine = "";
  }

  return variables;
}

// Add this function to read existing .env values
function readExistingEnvValues(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const values = {};

  const lines = content.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const [key, ...rest] = line.split("=");
    if (key && rest.length > 0) {
      values[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
    }
  }

  return values;
}

// In the GET function, after reading templates, also read existing values:
export async function GET() {
  try {
    const rootDir = process.cwd();
    const apiEnvPath = path.join(rootDir, "..", "api", ".env");
    const frontEnvPath = path.join(rootDir, "..", "front", ".env");

    const templates = {
      api: [],
      front: [],
    };

    const existingValues = {
      api: {},
      front: {},
    };

    if (fs.existsSync(apiEnvPath)) {
      const apiEnvContent = fs.readFileSync(apiEnvPath, "utf8");
      templates.api = parseEnvFile(apiEnvContent);
      existingValues.api = readExistingEnvValues(apiEnvPath);
    }

    if (fs.existsSync(frontEnvPath)) {
      const frontEnvContent = fs.readFileSync(frontEnvPath, "utf8");
      templates.front = parseEnvFile(frontEnvContent);
      existingValues.front = readExistingEnvValues(frontEnvPath);
    }

    return NextResponse.json({ templates, existingValues });
  } catch (error) {
    console.error("Error getting env templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
