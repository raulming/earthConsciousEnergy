import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../../db";
import { adminCredentials } from "../../../../db/schema";
import { ADMIN_USERNAME, createSessionCookie, isSameOriginRequest, verifyPassword } from "../../../admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "请求来源无效" }, { status: 403 });
  try {
    await ensureSchema();
    const payload = await request.json() as { username?: string; password?: string };
    if ((payload.username ?? "").trim().toLowerCase() !== ADMIN_USERNAME) return Response.json({ error: "账号或密码不正确" }, { status: 401 });
    const [credential] = await getDb().select().from(adminCredentials).where(eq(adminCredentials.username, ADMIN_USERNAME)).limit(1);
    if (!credential || !await verifyPassword(payload.password ?? "", credential.passwordSalt, credential.passwordHash, credential.passwordIterations)) return Response.json({ error: "账号或密码不正确" }, { status: 401 });
    return Response.json({ ok: true, username: ADMIN_USERNAME }, { headers: { "Set-Cookie": await createSessionCookie() } });
  } catch {
    return Response.json({ error: "登录暂时不可用" }, { status: 500 });
  }
}
