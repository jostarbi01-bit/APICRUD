// First execute setup via your server CLI parameters branch:
// npm install @neondatabase/serverless
import * as schema from "@/lib/db/schema/schema";
import * as dotenv from 'dotenv';
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({ path: '.env.local' });

// Force WebSocket connection caching paths for high-availability performance tuning
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_Neon_URL) {
  throw new Error("CRITICAL FLUSH ERROR: DATABASE_URL production key token is completely unmapped.");
}

// 1. Establish the high-performance serverless HTTP driver
const sqlClientConnectionEngine = neon(process.env.DATABASE_Neon_URL);

// 2. Export the type-safe Drizzle ORM client shell instance bundling database schema objects
export const db = drizzle(sqlClientConnectionEngine, { schema });

