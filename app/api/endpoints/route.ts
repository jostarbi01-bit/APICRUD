import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema/schema";
import { desc,eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

// -------------------------------------------------------------------------
// GET ACTION: Retrieves endpoints belonging ONLY to the logged-in operator
// -------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    // Intercept cookie headers via Better Auth v1.6.25 server core context
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Access Denied: Unauthenticated system operator context." },
        { status: 401 }
      );
    }

    const dataRecords = await db
      .select()
      .from(endpoints)
      .where(eq(endpoints.userId, session.user.id)) // strict isolated relationship bounds
      .orderBy(desc(endpoints.createdAt));

    return NextResponse.json(dataRecords, { status: 200 });
  } catch (error: any) {
    console.error("Authenticated GET Exception:", error);
    return NextResponse.json(
      { error: "Failed to extract contextual database parameters." },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------------------
// POST ACTION: Attaches the authenticated user's ID to new entries automatically
// -------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Access Denied: Operational credentials tracking profile missing." },
        { status: 401 }
      );
    }

    const payload = await req.json();
    const { name, path, method, description, mockBody } = payload;

    if (!name || !path || !method) {
      return NextResponse.json(
        { error: "Required structural validation boundaries missing." },
        { status: 400 }
      );
    }

    const [insertedRecord] = await db
      .insert(endpoints)
      .values({
        name,
        path,
        method,
        description: description || null,
        mockBody: mockBody || null, // Capture static raw custom configurations
        userId: session.user.id, // Automatic relationship injection wiring
      })
      .returning();

    return NextResponse.json(insertedRecord, { status: 201 });
  } catch (error: any) {
    console.error("Authenticated POST Exception:", error);
    return NextResponse.json(
      { error: "Failed to allocate new parameters inside relational cluster rows." },
      { status: 500 }
    );
  }
}

