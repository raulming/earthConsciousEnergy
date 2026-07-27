import { asc } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../db";
import { progressUpdates } from "../../../db/schema";
import { isAdminRequest } from "../../admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const rows = await getDb().select().from(progressUpdates).orderBy(asc(progressUpdates.createdAt), asc(progressUpdates.id));
    return Response.json({ updates: rows.map((row) => ({ ...row, breakthrough: row.breakthrough ? "重大突破" : undefined, added: true })) });
  } catch {
    return Response.json({ error: "进度数据暂时不可用" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdminRequest(request)) return Response.json({ error: "需要管理员登录" }, { status: 401 });
  try {
    await ensureSchema();
    const payload = await request.json() as { date?: string; energy?: number; note?: string; breakthrough?: boolean };
    const date = payload.date?.trim() ?? "";
    const energy = Number(payload.energy);
    if (!date || !Number.isFinite(energy) || energy < 0) return Response.json({ error: "请填写有效的日期和能量数值" }, { status: 400 });
    const [row] = await getDb().insert(progressUpdates).values({ id: crypto.randomUUID(), date, energy: Math.round(energy), note: payload.note?.trim() || "新增意识能量记录", breakthrough: Boolean(payload.breakthrough) }).returning();
    return Response.json({ update: { ...row, breakthrough: row.breakthrough ? "重大突破" : undefined, added: true } }, { status: 201 });
  } catch {
    return Response.json({ error: "保存进度失败" }, { status: 500 });
  }
}
