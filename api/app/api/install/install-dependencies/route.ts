import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { packageManager } = await request.json()

    if (!packageManager) {
      return NextResponse.json({ error: "Package manager is required" }, { status: 400 })
    }

    const results = {
      api: { success: false, logs: [] },
      front: { success: false, logs: [] },
    }

    // Check if directories exist
    const apiPath = path.join(process.cwd(), "..", "api")
    const frontPath = path.join(process.cwd(), "..", "front")

    if (!fs.existsSync(apiPath)) {
      return NextResponse.json(
        { error: "API directory not found. Make sure you have an api/ folder in your monorepo." },
        { status: 400 },
      )
    }

    if (!fs.existsSync(frontPath)) {
      return NextResponse.json(
        { error: "Frontend directory not found. Make sure you have a front/ folder in your monorepo." },
        { status: 400 },
      )
    }

    // Install API dependencies
    try {
      const apiCommand = `cd ${apiPath} && ${packageManager} install`
      const { stdout: apiStdout, stderr: apiStderr } = await execAsync(apiCommand)

      results.api.success = true
      results.api.logs = [`Running: ${apiCommand}`, apiStdout, ...(apiStderr ? [apiStderr] : [])]
    } catch (error) {
      results.api.logs = [
        `Failed to install API dependencies: ${error.message}`,
        error.stdout || "",
        error.stderr || "",
      ]
    }

    // Install Frontend dependencies
    try {
      const frontCommand = `cd ${frontPath} && ${packageManager} install`
      const { stdout: frontStdout, stderr: frontStderr } = await execAsync(frontCommand)

      results.front.success = true
      results.front.logs = [`Running: ${frontCommand}`, frontStdout, ...(frontStderr ? [frontStderr] : [])]
    } catch (error) {
      results.front.logs = [
        `Failed to install Frontend dependencies: ${error.message}`,
        error.stdout || "",
        error.stderr || "",
      ]
    }

    const success = results.api.success && results.front.success

    return NextResponse.json({ success, results })
  } catch (error) {
    console.error("Error installing dependencies:", error)
    return NextResponse.json({ error: "Failed to install dependencies" }, { status: 500 })
  }
}
