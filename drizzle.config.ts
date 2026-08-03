import { cwd } from "node:process";
import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Safely inject Next.js's .env.local variables into the Drizzle CLI compiler context
loadEnvConfig(cwd());

export default defineConfig({
  schema: "./lib/db/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    //// Read the variable using standard node local environments safely
    // url: process.env.DATABASE_URL!,  
 
    // Read the variable using Neon database cloud
    url: process.env.DATABASE_Neon_URL!,

  },
  strict: true,
  verbose: true,
});
  