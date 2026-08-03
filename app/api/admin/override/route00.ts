import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { policy } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) return NextResponse.json({ error: "Access Denied." }, { status: 401 });

    const [adminCheck] = await db.select().from(policy).where(eq(policy.userId, session.user.id));
    if (!adminCheck || adminCheck.role !== "admin") return NextResponse.json({ error: "Administrative clearance required." }, { status: 403 });

    const payload = await req.json();
    const { action, userId, targetCompanyId, targetRole } = payload;

    if (action === "reassign_user") {
      if (!userId || !targetCompanyId) return NextResponse.json({ error: "Required parameters missing." }, { status: 400 });
      await db.update(policy).set({ companyId: targetCompanyId }).where(eq(policy.userId, userId));
      return NextResponse.json({ success: true, message: "User company reassigned inside policy successfully." });
    }

    if (action === "update_role") {
      if (!userId || !targetRole) return NextResponse.json({ error: "Required parameters missing." }, { status: 400 });
      await db.update(policy).set({ role: targetRole }).where(eq(policy.userId, userId));
      return NextResponse.json({ success: true, message: "User access role tier modified successfully." });
    }

    return NextResponse.json({ error: "Unsupported operation command." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
