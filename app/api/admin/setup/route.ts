import { getDb } from "../../../../db";
import { adminCredentials } from "../../../../db/schema";
import { ADMIN_USERNAME, createSessionCookie, hashPassword, isAdminConfigured, isSameOriginRequest, verifySetupToken } from "../../../admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "请求来源无效" }, { status: 403 });
  try {
    if (await isAdminConfigured()) return Response.json({ error: "管理员密码已经设置" }, { status: 409 });
    const payload = await request.json() as { setupCode?: string; password?: string };
    const password = payload.password ?? "";
    if (!await verifySetupToken(payload.setupCode?.trim() ?? "")) return Response.json({ error: "一次性设置码不正确" }, { status: 403 });
    if (password.length < 12) return Response.json({ error: "密码至少需要 12 位" }, { status: 400 });
    const credential = await hashPassword(password);
    await getDb().insert(adminCredentials).values({ username: ADMIN_USERNAME, passwordSalt: credential.salt, passwordHash: credential.hash, passwordIterations: credential.iterations });
    return Response.json({ ok: true, username: ADMIN_USERNAME }, { status: 201, headers: { "Set-Cookie": await createSessionCookie() } });
  } catch {
    return Response.json({ error: "管理员设置失败，请稍后再试" }, { status: 500 });
  }
}
