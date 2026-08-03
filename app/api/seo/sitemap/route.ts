import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema/schema";

// Enforces server-side compilation rules instead of edge cache layers
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicDomain = "https://api-engine.workspace"; // Replace with your live platform domain string

    // 1. Define foundational core application view navigation index strings
    const staticBaseRoutes = [
      { url: `${publicDomain}/`, priority: "1.0", changefreq: "daily" },
      { url: `${publicDomain}#about`, priority: "0.8", changefreq: "weekly" },
      { url: `${publicDomain}#manage`, priority: "0.9", changefreq: "always" },
    ];

    // 2. Query dynamic user endpoint parameters maps from PostgreSQL database
    const activeRouteRecords = await db
      .select({
        id: endpoints.id,
        updatedAt: endpoints.updatedAt
      })
      .from(endpoints);

    // 3. Assemble complete structured sitemap node map collections
    const sitemapNodes = [
      ...staticBaseRoutes.map(route => `
        <url>
          <loc>${route.url}</loc>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
          <changefreq>${route.changefreq}</changefreq>
          <priority>${route.priority}</priority>
        </url>
      `),
      ...activeRouteRecords.map(route => `
        <url>
          <loc>${publicDomain}/endpoints/${route.id}</loc>
          <lastmod>${new Date(route.updatedAt).toISOString().split('T')[0]}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.7</priority>
        </url>
      `)
    ];

    // 4. Wrap elements inside standard web XML Sitemap wrapper formats [1]
    const rawXmlOutput = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://sitemaps.org">
      ${sitemapNodes.join("")}
    </urlset>`.trim();

    // 5. Return explicit content type headers so bot crawlers parse strings correctly [1]
    return new NextResponse(rawXmlOutput, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600"
      }
    });

  } catch (error: any) {
    console.error("SEO Sitemap Stream Generation Exception Error:", error);
    // Simple fallback structural text allows bot crawling threads to finish gracefully
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://sitemaps.org"></urlset>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" }
    });
  }
}
