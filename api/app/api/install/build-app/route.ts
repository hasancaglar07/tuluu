import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { app, packageManager } = await request.json();

    if (!app || !packageManager) {
      return NextResponse.json(
        {
          success: false,
          error: "App and package manager are required",
          details: `Received app: ${app}, packageManager: ${packageManager}`,
        },
        { status: 400 }
      );
    }

    const appPath = path.join(process.cwd(), "..", app);

    if (!fs.existsSync(appPath)) {
      return NextResponse.json(
        {
          success: false,
          error: `${app} directory not found`,
          details: `Looked for directory at: ${appPath}`,
          suggestion: `Make sure you have a ${app}/ folder in your monorepo root`,
        },
        { status: 400 }
      );
    }

    // Check if package.json exists
    const packageJsonPath = path.join(appPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return NextResponse.json(
        {
          success: false,
          error: `package.json not found in ${app} directory`,
          details: `Looked for package.json at: ${packageJsonPath}`,
          suggestion: "Make sure your project has a valid package.json file",
        },
        { status: 400 }
      );
    }

    const logs = [];
    let success = false;
    let buildOutput = "";
    let buildError = "";

    try {
      const buildCommand = `cd ${appPath} && ${packageManager} run build`;
      logs.push(`🔧 Executing build command: ${buildCommand}`);
      logs.push(`📁 Working directory: ${appPath}`);
      logs.push(`📦 Package manager: ${packageManager}`);

      const { stdout, stderr } = await execAsync(buildCommand, {
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      buildOutput = stdout;
      buildError = stderr;

      if (stdout) {
        logs.push("--- BUILD OUTPUT ---");
        logs.push(stdout);
      }

      if (stderr) {
        logs.push("--- BUILD WARNINGS/ERRORS ---");
        logs.push(stderr);
      }

      success = true;
      logs.push(`✅ ${app} build completed successfully`);
    } catch (error: any) {
      success = false;

      logs.push(`❌ Build command failed: ${error.message}`);
      logs.push(`Exit code: ${error.code || "unknown"}`);
      logs.push(`Signal: ${error.signal || "none"}`);

      if (error.stdout) {
        logs.push("--- STDOUT FROM FAILED BUILD ---");
        logs.push(error.stdout);
        buildOutput = error.stdout;
      }

      if (error.stderr) {
        logs.push("--- STDERR FROM FAILED BUILD ---");
        logs.push(error.stderr);
        buildError = error.stderr;
      }

      // Additional error context
      if (error.code === "ENOENT") {
        logs.push(
          "💡 SUGGESTION: The build command or package manager might not be found"
        );
        logs.push(
          `   Make sure ${packageManager} is installed and the 'build' script exists in package.json`
        );
      }

      if (error.signal === "SIGTERM") {
        logs.push(
          "💡 SUGGESTION: Build was terminated (possibly due to timeout)"
        );
      }

      if (error.code === 1) {
        logs.push("💡 SUGGESTION: Build failed due to compilation errors");
        logs.push("   Check the error messages above for specific issues");
      }
    }

    return NextResponse.json({
      success,
      logs,
      stdout: buildOutput,
      stderr: buildError,
      error: success ? null : "Build process failed",
      details: success
        ? null
        : "Check the logs above for detailed error information",
      buildCommand: `cd ${appPath} && ${packageManager} run build`,
      workingDirectory: appPath,
    });
  } catch (error: any) {
    console.error("Error in build-app API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during build process",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
