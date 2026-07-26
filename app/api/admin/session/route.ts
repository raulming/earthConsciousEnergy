import { ADMIN_USERNAME, isAdminConfigured, isAdminRequest } from "../../../admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const [configured, authenticated] = await Promise.all([isAdminConfigured(), isAdminRequest(request)]);
    return Response.json({ configured, authenticated, username: authenticated ? ADMIN_USERNAME : null });
  } catch {
    return Response.json({ error: "管理员状态暂时不可用" }, { status: 500 });
  }
}
