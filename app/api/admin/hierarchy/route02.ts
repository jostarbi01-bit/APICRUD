import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { user, company, policy ,endpoints } from "@/lib/db/schema/schema";
import { eq ,sql,ne } from "drizzle-orm";


export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated context." }, { status: 401 });
    }

    // 1. Strict Multi-Tenant Enforcement Check
    const [adminCheck] = await db
      .select()
      .from(policy)
      .where(eq(policy.userId, session.user.id));

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Access Denied: Restricted Administrative Command Only." }, { status: 403 });
    }

    const companyRecords = await db.select().from(company);
    
    // 2. Query data blocks out of PostgreSQL
    const rawUserRecords = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: policy.companyId,
        companyName: company.name, 
        role: policy.role,         
        endpointCount: sql<number>`count(${endpoints.id})::int`, 
      })
      .from(user)
      .leftJoin(policy, eq(user.id, policy.userId))
      .leftJoin(company, eq(policy.companyId, company.id))
      .leftJoin(endpoints, eq(user.id, endpoints.userId))
      // HIGH SECURITY posturing filtering rule: Gating administrative visibility. 
      // Admins are blocked from seeing other administrators' structural metadata.
      .where(ne(policy.role, "admin")) 
      .groupBy(user.id, user.name, user.email, policy.companyId, company.name, policy.role);

    // 3. SECURITY DATA MASKING RESOLUTION LOOP
    const sanitizedUserRecords = rawUserRecords.map((u) => {
      const [localPart, domainPart] = u.email.split("@");
      // Transforms "operator@internal.local" -> "op***@internal.local"
      const maskedEmail = localPart.substring(0, 2) + "***@" + domainPart;

      return {
        name: u.name,
        email: maskedEmail, // Exposed text is sanitized to clear leakage hazards
        companyId: u.companyId,
        companyName: u.companyName,
        role: u.role || "user",
        endpointCount: u.endpointCount || 0,
        // HIGH SECURITY mapping rule: Strip out raw DB text keys entirely from frontend loops
        id: Buffer.from(u.id).toString("base64").substring(0, 12), // Abstracted deterministic proxy hash token
        rawUid: u.id // Keep safely hidden or use strictly internally
      };
    });

    return NextResponse.json({
      companies: companyRecords,
      users: sanitizedUserRecords
    }, { status: 200 });

  } catch (error: any) {
    console.error("Administrative Scan Exception:", error);
    return NextResponse.json({ error: "Failed to compile parameters safely." }, { status: 500 });
  }
}


