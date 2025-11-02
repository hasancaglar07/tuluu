import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { envVars } = await request.json()

    if (!envVars || !envVars.api || !envVars.front) {
      return NextResponse.json({ error: "Environment variables are required" }, { status: 400 })
    }

    const savedFiles = []

    // Save API environment variables
    const apiPath = path.join(process.cwd(), "..", "api")
    const apiEnvPath = path.join(apiPath, ".env")

    if (fs.existsSync(apiPath)) {
      const apiEnvContent = Object.entries(envVars.api)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")

      fs.writeFileSync(apiEnvPath, apiEnvContent)
      savedFiles.push("api/.env")
    }

    // Save Frontend environment variables
    const frontPath = path.join(process.cwd(), "..", "front")
    const frontEnvPath = path.join(frontPath, ".env")

    if (fs.existsSync(frontPath)) {
      const frontEnvContent = Object.entries(envVars.front)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")

      fs.writeFileSync(frontEnvPath, frontEnvContent)
      savedFiles.push("front/.env")
    }

    return NextResponse.json({
      success: true,
      savedFiles,
      message: "Environment variables saved successfully",
    })
  } catch (error) {
    console.error("Error saving environment variables:", error)
    return NextResponse.json({ error: "Failed to save environment variables" }, { status: 500 })
  }
}
