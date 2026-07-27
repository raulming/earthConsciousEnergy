import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("source deployment keeps the application behind Nginx", async () => {
  const [service, nginx] = await Promise.all([
    source("deploy/blue-planet-energy-map.service.example"),
    source("deploy/nginx.conf.example"),
  ]);

  assert.match(service, /User=blueplanet/);
  assert.match(service, /ReadWritePaths=\/var\/lib\/blue-planet-energy-map/);
  assert.match(service, /EnvironmentFile=\/etc\/blue-planet-energy-map\.env/);
  assert.match(nginx, /X-Forwarded-Host/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:3000/);
});

test("source deployment requires secrets and persistent local D1", async () => {
  const [startup, config] = await Promise.all([
    source("scripts/selfhost-start.mjs"),
    source("wrangler.selfhost.jsonc"),
  ]);

  assert.match(startup, /ADMIN_SETUP_TOKEN/);
  assert.match(startup, /ADMIN_SESSION_SECRET/);
  assert.match(startup, /--persist-to/);
  assert.match(startup, /--env-file/);
  assert.match(config, /"binding": "DB"/);
});
