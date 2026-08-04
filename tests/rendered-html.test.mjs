import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);
const source = (path) => readFile(projectFile(path), "utf8");

test("recreates the energy map reference as a responsive animated interface", async () => {
  const [page, styles] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(page, /function Starfield\(\)/);
  assert.match(page, /src="\/blue-planet-energy-map\.webp"/);
  assert.match(page, /className="live-energy"/);
  assert.match(page, /className="orbit-trace trace-one"/);
  assert.match(page, /className="vertical-energy-beam"/);
  assert.match(page, /<p className="hero-slogan"><strong>穿越群星<\/strong><em>共启新纪元<\/em><\/p>/);
  assert.match(page, /记录蓝星意识能量的每一次跃迁，以核心准则为坐标，见证共同前行。/);
  assert.match(page, /cancelAnimationFrame\(frame\)/);
  assert.match(styles, /@keyframes radiancePulse/);
  assert.match(styles, /@keyframes satelliteTravel/);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("focuses major breakthroughs and presents every principle as a memorable focal sequence", async () => {
  const [page, styles] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(page, /function FocusSequence/);
  assert.match(page, /BREAKTHROUGH FOCUS/);
  assert.match(page, /核心准则，铭记于心/);
  assert.match(page, /世界大同，万物共荣的信仰。/);
  assert.match(page, /分别心与二元对立四项标准的运用。/);
  assert.match(page, /onFocus=\{\(\) => onActiveChange\(index\)\}/);
  assert.match(styles, /\.focus-frame/);
  assert.match(styles, /\.milestone\.breakthrough\.is-focus-active/);
  assert.match(styles, /\.principle-statement/);
  assert.match(styles, /@keyframes principleStatementIn/);
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
