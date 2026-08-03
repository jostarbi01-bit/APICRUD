import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { company, policy } from "@/lib/db/schema/schema";
import { eq, and } from "drizzle-orm";


interface RouteParams {
  params: Promise<{ id?: string }>;
}

// Keep POST and PUT methods completely intact for architectural alignment...
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) 
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    const [adminCheck] = await db.select().from(policy).where(eq(policy.userId, session.user.id));

    if (!adminCheck || adminCheck.role !== "admin") 
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    const payload = await req.json();
    const { name, domain } = payload;

    if (!name) return NextResponse.json({ error: "Company name missing." }, { status: 400 });
    const [existing] = await db.select().from(company).where(eq(company.name, name));

    if (existing) return NextResponse.json({ error: "Company already exists." }, { status: 409 });
    const [newComp] = await db.insert(company).values({ name, domain: domain || null, updatedAt: new Date() }).returning();
    return NextResponse.json(newComp, { status: 201 });
  }
   catch { return NextResponse.json({ error: "Server Error" }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session || !session.user) 
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    const [adminCheck] = await db.select().from(policy).where(eq(policy.userId, session.user.id));
    
    if (!adminCheck || adminCheck.role !== "admin") 
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("id");

    if (!companyId) return NextResponse.json({ error: "Company ID missing." }, { status: 400 });
   
    if (companyId === "CompanyDemo") 
      return NextResponse.json({ error: "Cannot mutate baseline company." }, { status: 400 });
    
    const payload = await req.json();
    const { name, domain } = payload;
    const [updated] = await db.update(company).set({ name, domain: domain || null, updatedAt: new Date() }).where(eq(company.id, companyId)).returning();
    return NextResponse.json(updated, { status: 200 });
  } 
  catch { return NextResponse.json({ error: "Server Error" }, { status: 500 }); }
}

// -------------------------------------------------------------------------
// FIXED DELETE ACTION: Moves affected operators to CompanyDemo before purging
// -------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    // 1. Authenticate administrative operator context
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated context." }, { status: 401 });
    }

    const [adminCheck] = await db
      .select()
      .from(policy)
      .where(eq(policy.userId, session.user.id));

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Access Denied: Administrative clearance required." }, { status: 403 });
    }

    // 2. Extract companyId identifier from query segment parameters
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("id");

    if (!companyId) {
      return NextResponse.json({ error: "Company UUID parameter is missing from the query string." }, { status: 400 });
    }

    // Protection rule: Prevent purging the core baseline fallback node
    const [targetCompany] = await db.select().from(company).where(eq(company.id, companyId));
    if (!targetCompany) {
      return NextResponse.json({ error: "Corporate node not found." }, { status: 404 });
    }
    if (targetCompany.name === "CompanyDemo") {
      return NextResponse.json({ error: "Protected Entity: The master tenant 'CompanyDemo' cannot be deleted." }, { status: 400 });
    }

    // 3. Locate or Seed the system default "CompanyDemo" row to acquire its strict UUID reference
    let [demoCompany] = await db
      .select()
      .from(company)
      .where(eq(company.name, "CompanyDemo"));

    if (!demoCompany) {
      console.log("[Safety Sync Engine] Re-seeding missing master baseline entity 'CompanyDemo'.");
      [demoCompany] = await db
        .insert(company)
        .values({
          name: "CompanyDemo",
          domain: "demo.internal"
        })
        .returning();
    }

    // 4. SAFE USER REASSIGNMENT TRANSITION
    // Moves all user policies bound to the company about to be purged back to CompanyDemo
    console.log(`[Safety Guard] Re-routing user policies from company ID ${companyId} back to CompanyDemo ID ${demoCompany.id}`);

    await db
      .update(policy)
      .set({
        companyId: demoCompany.id,
        updatedAt: new Date()
      })
      .where(eq(policy.companyId, companyId));

    // 5. Now it is safe to erase the company record without triggering user cascade deletes
    const [deletedCompany] = await db
      .delete(company)
      .where(eq(company.id, companyId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Tenant node "${deletedCompany.name}" successfully removed. All associated operators have been gracefully rolled back to CompanyDemo.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database Company Safe Purge Exception Matrix Error:", error);
    return NextResponse.json({ error: "Safe purge migration sequence execution failure." }, { status: 500 });
  }
}
