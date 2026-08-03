import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { user, company, policy ,endpoints } from "@/lib/db/schema/schema";
import { eq ,sql } from "drizzle-orm";


// -------------------------------------------------------------------------
// GET ACTION: Compiles complete corporate trees with user endpoint tallies
// -------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    // 1. Decrypt incoming cookie tokens via Better Auth server utilities
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Access Denied: Unauthenticated system context." }, 
        { status: 401 }
      );
    }

    // 2. Guard Condition: Query privilege role policies from PostgreSQL
    const [adminCheck] = await db
      .select()
      .from(policy)
      .where(eq(policy.userId, session.user.id));

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json(
        { error: "Access Denied: Restricted Administrative Access Only." }, 
        { status: 403 }
      );
    }

    // 3. Extract all registered Corporate Tenant Nodes out of Company table
    const companyRecords = await db.select().from(company);
    
    // 4. FIXED MAPPING LAYER: Left join endpoints and execute aggregate count grouping
    const userRecords = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: policy.companyId,
        companyName: company.name, 
        role: policy.role,         
        // Runs server-side SQL aggregation counting total matched authored endpoints
        endpointCount: sql<number>`count(${endpoints.id})::int`, 
      })
      .from(user)
      .leftJoin(policy, eq(user.id, policy.userId))
      .leftJoin(company, eq(policy.companyId, company.id))
      .leftJoin(endpoints, eq(user.id, endpoints.userId)) // Join path to catch author row maps
      .groupBy(user.id, user.name, user.email, policy.companyId, company.name, policy.role);

    // 5. Stream uniform structural layout data back to client components
    return NextResponse.json({
      companies: companyRecords,
      users: userRecords
    }, { status: 200 });

  } catch (error: any) {
    console.error("Critical System Hierarchy Compilation Exception:", error);
    return NextResponse.json(
      { error: "Failed to map system deployment tree parameters correctly." }, 
      { status: 500 }
    );
  }
}

