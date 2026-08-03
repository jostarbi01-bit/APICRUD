import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema/schema";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const { id } = await params;
    const payload = await req.json();
    const { name, path, method, description, mockBody } = payload;

    const [updatedRecord] = await db
      .update(endpoints)
      .set({
        ...(name && { name }),
        ...(path && { path }),
        ...(method && { method }),
        ...(description !== undefined && { description: description || null }),
        ...(mockBody !== undefined && { mockBody: mockBody || null }),
        updatedAt: new Date(),
      })
      .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)))
      .returning();

    if (!updatedRecord) {
      return NextResponse.json({ error: "Endpoint record not found." }, { status: 404 });
    }

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update record details." }, { status: 500 });
  }
}

// Keeping GET and DELETE methods exactly as configured previously...
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    const { id } = await params;
    const [targetRecord] = await db.select().from(endpoints).where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)));
    if (!targetRecord) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(targetRecord, { status: 200 });
  } catch (error) { return NextResponse.json({ error: "Error." }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    const { id } = await params;
    const [deletedRecord] = await db.delete(endpoints).where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id))).returning();
    if (!deletedRecord) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) { return NextResponse.json({ error: "Error." }, { status: 500 }); }
}

