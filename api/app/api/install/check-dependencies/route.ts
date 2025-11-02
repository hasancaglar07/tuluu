import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split(".").map(Number)
  const v2parts = version2.split(".").map(Number)

  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0
    const v2part = v2parts[i] || 0

    if (v1part > v2part) return 1
    if (v1part < v2part) return -1
  }

  return 0
}

async function checkCommand(
  command: string,
  versionFlag = "--version",
): Promise<{ version: string | null; status: string }> {
  try {
    const { stdout } = await execAsync(`${command} ${versionFlag}`)
    const versionMatch = stdout.match(/(\d+\.\d+\.\d+)/)

    if (versionMatch) {
      return { version: versionMatch[1], status: "found" }
    }

    return { version: null, status: "not-found" }
  } catch (error) {
    return { version: null, status: "not-found" }
  }
}

export async function GET() {
  try {
    const requirements = {
      node: "23.0.0",
      npm: "10.0.0",
      pnpm: "9.1.2",
      bun: "1.2.5",
    }

    // Check Node.js
    const nodeResult = await checkCommand("node")
    const nodeStatus =
      nodeResult.status === "found" && nodeResult.version
        ? compareVersions(nodeResult.version, requirements.node) >= 0
          ? "satisfied"
          : "unsatisfied"
        : "not-found"

    // Check npm
    const npmResult = await checkCommand("npm")
    const npmStatus =
      npmResult.status === "found" && npmResult.version
        ? compareVersions(npmResult.version, requirements.npm) >= 0
          ? "satisfied"
          : "unsatisfied"
        : "not-found"

    // Check pnpm
    const pnpmResult = await checkCommand("pnpm")
    const pnpmStatus =
      pnpmResult.status === "found" && pnpmResult.version
        ? compareVersions(pnpmResult.version, requirements.pnpm) >= 0
          ? "satisfied"
          : "unsatisfied"
        : "not-found"

    // Check bun
    const bunResult = await checkCommand("bun")
    const bunStatus =
      bunResult.status === "found" && bunResult.version
        ? compareVersions(bunResult.version, requirements.bun) >= 0
          ? "satisfied"
          : "unsatisfied"
        : "not-found"

    const dependencies = {
      node: {
        version: nodeResult.version,
        required: requirements.node,
        status: nodeStatus,
      },
      npm: {
        version: npmResult.version,
        required: requirements.npm,
        status: npmStatus,
      },
      pnpm: {
        version: pnpmResult.version,
        required: requirements.pnpm,
        status: pnpmStatus,
      },
      bun: {
        version: bunResult.version,
        required: requirements.bun,
        status: bunStatus,
      },
    }

    return NextResponse.json({ dependencies })
  } catch (error) {
    console.error("Error checking dependencies:", error)
    return NextResponse.json({ error: "Failed to check dependencies" }, { status: 500 })
  }
}
