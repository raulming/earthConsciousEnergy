import { chmod, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const required = ["ADMIN_SETUP_TOKEN", "ADMIN_SESSION_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[selfhost] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.ADMIN_SESSION_SECRET.length < 48) {
  console.error("[selfhost] ADMIN_SESSION_SECRET must contain at least 48 characters.");
  process.exit(1);
}

const root = process.cwd();
const dataDir = process.env.SELFHOST_DATA_DIR || "/data";
const port = process.env.PORT || "3000";
const devVarsPath = path.join(dataDir, ".dev.vars.runtime");
const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const configPath = path.join(root, "wrangler.selfhost.jsonc");

await mkdir(dataDir, { recursive: true });
await writeFile(
  devVarsPath,
  [
    `ADMIN_SETUP_TOKEN=${JSON.stringify(process.env.ADMIN_SETUP_TOKEN)}`,
    `ADMIN_SESSION_SECRET=${JSON.stringify(process.env.ADMIN_SESSION_SECRET)}`,
    "",
  ].join("\n"),
  { mode: 0o600 },
);
await chmod(devVarsPath, 0o600);

const server = spawn(process.execPath, [
  wranglerBin,
  "dev",
  "--local",
  "--ip",
  "0.0.0.0",
  "--port",
  port,
  "--persist-to",
  dataDir,
  "--env-file",
  devVarsPath,
  "--config",
  configPath,
], { stdio: "inherit", env: process.env });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
