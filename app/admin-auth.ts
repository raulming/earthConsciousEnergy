import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../db";
import { adminCredentials } from "../db/schema";

export const ADMIN_USERNAME = "admin";
export const ADMIN_COOKIE = "blue_planet_admin_session";
export const PASSWORD_ITERATIONS = 310_000;
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

type RuntimeEnv = {
  ADMIN_SETUP_TOKEN?: string;
  ADMIN_SESSION_SECRET?: string;
};

function runtimeEnv() {
  return env as unknown as RuntimeEnv;
}

function toBase64Url(bytes: Uint8Array) {
  let value = "";
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function asBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function hashPassword(password: string, salt?: Uint8Array, iterations = PASSWORD_ITERATIONS) {
  const passwordSalt = salt ?? crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: asBuffer(passwordSalt), iterations }, key, 256);
  return { salt: toBase64Url(passwordSalt), hash: toBase64Url(new Uint8Array(bits)), iterations };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string, iterations: number) {
  const candidate = await hashPassword(password, fromBase64Url(salt), iterations);
  return constantTimeEqual(candidate.hash, expectedHash);
}

export async function isAdminConfigured() {
  await ensureSchema();
  const rows = await getDb().select({ username: adminCredentials.username }).from(adminCredentials).where(eq(adminCredentials.username, ADMIN_USERNAME)).limit(1);
  return rows.length === 1;
}

export async function verifySetupToken(candidate: string) {
  const expected = runtimeEnv().ADMIN_SETUP_TOKEN;
  return Boolean(expected) && await constantTimeEqual(candidate, expected!);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const publicOrigin = forwardedHost
      ? new URL(`${forwardedProto || requestUrl.protocol.replace(":", "")}://${forwardedHost}`).origin
      : requestUrl.origin;
    return new URL(origin).origin === publicOrigin;
  } catch {
    return false;
  }
}

export async function createSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ username: ADMIN_USERNAME, expiresAt })));
  const signature = await sign(payload);
  return `${ADMIN_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  if (!isSameOriginRequest(request)) return false;
  const token = readCookie(request.headers.get("cookie") ?? "", ADMIN_COOKIE);
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!await verifySignature(payload, signature)) return false;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { username?: string; expiresAt?: number };
    return parsed.username === ADMIN_USERNAME && typeof parsed.expiresAt === "number" && parsed.expiresAt > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

async function sign(payload: string) {
  const secret = runtimeEnv().ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is unavailable");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}

async function verifySignature(payload: string, signature: string) {
  const secret = runtimeEnv().ADMIN_SESSION_SECRET;
  if (!secret) return false;
  try {
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, asBuffer(fromBase64Url(signature)), encoder.encode(payload));
  } catch { return false; }
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(left)), crypto.subtle.digest("SHA-256", encoder.encode(right))]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < Math.max(leftBytes.length, rightBytes.length); index++) difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  return difference === 0;
}

function readCookie(header: string, name: string) {
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}
