import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { policy } from "@/lib/db/schema/schema";
import { eq,and } from "drizzle-orm";


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const [adminCheck] = await db.select().from(policy).where(eq(policy.userId, session.user.id));
    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Access Denied: Administrative clearance required." }, { status: 403 });
    }

    const payload = await req.json();
    const { action, userId, targetCompanyId, targetRole } = payload;

    // HIGH SECURITY GUARD BLOCK: Prevents "Suicide Execution" mutations
    if (userId === session.user.id) {
      return NextResponse.json({ 
        error: "Forbidden Action: You cannot downgrade your own roles or alter your active admin workspace node status parameters." 
      }, { status: 400 });
    }

    if (action === "reassign_user") {
      if (!userId || !targetCompanyId) return NextResponse.json({ error: "Parameters missing." }, { status: 400 });
      await db.update(policy).set({ companyId: targetCompanyId }).where(eq(policy.userId, userId));
      return NextResponse.json({ success: true, message: "User company reassigned successfully." });
    }

    if (action === "update_role") {
      if (!userId || !targetRole) return NextResponse.json({ error: "Parameters missing." }, { status: 400 });
      const validRoles = ["guest", "user", "superuser", "admin"];
      if (!validRoles.includes(targetRole)) return NextResponse.json({ error: "Invalid role signature." }, { status: 400 });

      await db.update(policy).set({ role: targetRole }).where(eq(policy.userId, userId));
      return NextResponse.json({ success: true, message: "User policy assignment synchronized cleanly." });
    }

    return NextResponse.json({ error: "Unsupported system command orchestration action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Execution loop failure" }, { status: 500 });
  }
}

