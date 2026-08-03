import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";    //better auth
import { endpoints } from "@/lib/db/schema/schema";
import { and, eq } from "drizzle-orm";
import axios, { Method } from "axios";


interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleProxyPipeline(req: NextRequest, id: string, httpMethod: Method) {
  try {
    // 1. Authenticate user context via Better Auth request cookie headers
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated operator." }, { status: 401 });
    }

    // 2. Query target endpoint configuration out of PostgreSQL database
    const [targetRecord] = await db
      .select()
      .from(endpoints)
      .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)));

    // If the record UUID does not exist or belongs to another user, return a safe 404 catch
    if (!targetRecord) {
      return NextResponse.json({ error: `Endpoint profile ID ${id} not found.` }, { status: 404 });
    }

    // 3. Fallback tracking to external mock URL if path is not a full HTTP link
    const targetUrl = targetRecord.path.startsWith("http")
      ? targetRecord.path
      : "https://ai-cats.net";

    let outgoingBody = undefined;
    const isMutationMethod = ["POST", "PUT", "PATCH"].includes(httpMethod);

    if (isMutationMethod && targetRecord.mockBody) {
      try {
        outgoingBody = JSON.parse(targetRecord.mockBody);
      } catch {
        outgoingBody = targetRecord.mockBody;
      }
    }

    const customHeaders: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "API-Engine-Workspace-Validator/1.0"
    };

    if (isMutationMethod && outgoingBody) {
      customHeaders["Content-Type"] = "application/json";
    }

    console.log(`[Proxy Link Router] Resolving ${httpMethod} -> Target: ${targetUrl}`);

    // 4. Fire external HTTP request
    const externalResponse = await axios({
      method: httpMethod,
      url: targetUrl,
      data: outgoingBody,
      timeout: 8000,
      headers: customHeaders
    });

    return NextResponse.json({
      success: true,
      proxyStatus: externalResponse.status,
      proxyStatusText: externalResponse.statusText,
      data: externalResponse.data
    }, { status: 200 });

  } catch (error: any) {
    console.error(`External Proxy Error during ${httpMethod}:`, error.message);
    return NextResponse.json(
      { 
        error: `External Proxy ${httpMethod} Request Failed`,
        details: error.response?.data || error.message,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}

// -------------------------------------------------------------------------
// Next.js 16.2 App Router Route Dynamic Verb Multi-Exports
// -------------------------------------------------------------------------
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleProxyPipeline(req, id, "GET");
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleProxyPipeline(req, id, "POST");
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleProxyPipeline(req, id, "PUT");
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleProxyPipeline(req, id, "DELETE");
}


