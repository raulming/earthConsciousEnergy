import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../../db";
import { progressUpdates } from "../../../../db/schema";
import { isAdminRequest } from "../../../admin-auth";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminRequest(request)) return Response.json({ error: "需要管理员登录" }, { status: 401 });
  try {
    await ensureSchema();
    const { id } = await context.params;
    await getDb().delete(progressUpdates).where(eq(progressUpdates.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "删除进度失败" }, { status: 500 });
  }
}
