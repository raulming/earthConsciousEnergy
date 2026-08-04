import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);
const source = (path) => readFile(projectFile(path), "utf8");

test("uses the supplied energy map as a responsive animated hero", async () => {
  const [page, styles] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(page, /src="\/blue-planet-energy-map\.webp"/);
  assert.match(page, /<strong>穿越群星<\/strong><em>共启新纪元<\/em>/);
  assert.match(page, /记录蓝星意识能量的每一次跃迁，以核心准则为坐标，见证共同前行。/);
  assert.match(styles, /@media \(max-width: 680px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("keeps visitors read-only and exposes maintenance controls only to admins", async () => {
  const page = await source("app/page.tsx");

  assert.match(page, /adminStatus === "admin" && <button[^>]+className="add-btn"/);
  assert.match(page, /adminStatus === "admin" && item\.id && <button[^>]+className="delete-progress"/);
  assert.match(page, /访客只读/);
  assert.match(page, /管理员登录/);
  assert.match(page, /首次设置管理员密码/);
  assert.doesNotMatch(page, /localStorage\.setItem\("blue-planet-progress-updates"/);
});

test("protects every progress mutation with the server-side admin session", async () => {
  const [collectionRoute, itemRoute, auth] = await Promise.all([
    source("app/api/progress/route.ts"),
    source("app/api/progress/[id]/route.ts"),
    source("app/admin-auth.ts"),
  ]);

  assert.match(collectionRoute, /export async function GET\(\)/);
  assert.match(collectionRoute, /export async function POST\(request: Request\)/);
  assert.match(collectionRoute, /if \(!await isAdminRequest\(request\)\)/);
  assert.match(itemRoute, /export async function DELETE/);
  assert.match(itemRoute, /if \(!await isAdminRequest\(request\)\)/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(auth, /PBKDF2/);
  assert.match(auth, /PASSWORD_ITERATIONS = 310_000/);
});

test("uses a fixed admin identity and one-time password setup", async () => {
  const [setup, login, schema, hosting] = await Promise.all([
    source("app/api/admin/setup/route.ts"),
    source("app/api/admin/login/route.ts"),
    source("db/schema.ts"),
    source(".openai/hosting.json"),
  ]);

  assert.match(setup, /verifySetupToken/);
  assert.match(setup, /password\.length < 12/);
  assert.match(login, /ADMIN_USERNAME/);
  assert.match(schema, /adminCredentials/);
  assert.match(schema, /progressUpdates/);
  assert.match(hosting, /"d1": "DB"/);
});
