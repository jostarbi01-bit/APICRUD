import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema/schema";
import * as dotenv from 'dotenv';



dotenv.config({ path: '.env.local' })
export const db = drizzle(process.env.DATABASE_URL! ,{schema});


// dotenv.config({ path: '.env.local' });
// // Read connection parameters natively from local environments
// const connectionString = process.env.DATABASE_URL!;

// if (!connectionString) {
//   throw new Error("DATABASE_URL environment variable is missing inside .env.local configuration file.");
// }

// // Global cached client instance wrapper matching development workflows
// const globalForDrizzle = globalThis as unknown as {
//   pool: Pool | undefined;
// };

// let pool: Pool;

// if (process.env.NODE_ENV !== "production") {
//   if (!globalForDrizzle.pool) {
//     globalForDrizzle.pool = new Pool({ connectionString });
//   }
//   pool = globalForDrizzle.pool;
// } else {
//   pool = new Pool({ connectionString });
// }

// // Export structural instantiation handler client
// export const db = drizzle(pool, { schema });


