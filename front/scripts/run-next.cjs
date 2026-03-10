const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

const env = { ...process.env, NAPI_RS_FORCE_WASI: process.env.NAPI_RS_FORCE_WASI || "1" };
delete env.NODE_OPTIONS;

if (process.platform === "win32") {
  const winNativeBindingPath = path.join(
    __dirname,
    "..",
    "node_modules",
    "@tailwindcss",
    "oxide-win32-x64-msvc",
    "tailwindcss-oxide.win32-x64-msvc.node"
  );

  if (existsSync(winNativeBindingPath)) {
    env.NAPI_RS_NATIVE_LIBRARY_PATH = winNativeBindingPath;
  }
}

const child = spawn(process.execPath, [nextBin, ...args], {
  env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
