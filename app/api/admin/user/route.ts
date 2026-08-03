import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { user, policy } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";

// -------------------------------------------------------------------------
// DELETE ACTION: Erases a targeted user profile permanently out of the system
// -------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    // 1. Authenticate system operator session context via Better Auth cookies
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated context." }, { status: 401 });
    }

    // 2. Strict Role Verification Guard: Enforce admin-only access
    const [adminCheck] = await db
      .select().from(policy).where(eq(policy.userId, session.user.id));

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Access Denied: Administrative clearance required." }, { status: 403 });
    }

    // 3. Extract parameter identifier variables from search queries
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "Required input parameter (User ID) is missing." }, { status: 400 });
    }

    // 4. PROTECTION RULE: Gating self-deletion scenarios
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Operation Forbidden: You cannot remove your own administrative account profile." }, { status: 400 });
    }

    // 5. Execute secure Drizzle database schema mutation delete loop
    const [deletedUser] = await db
      .delete(user) .where(eq(user.id, targetUserId)) .returning();

    if (!deletedUser) {
      return NextResponse.json({ error: "Target user account not found inside registry records." }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Operator profile "${deletedUser.name}" successfully wiped from system tracking matrix.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database User Purge Execution Error:", error);
    return NextResponse.json({ error: "Purge sequence execution failure." }, { status: 500 });
  }
}
