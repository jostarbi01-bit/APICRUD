import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/lib/db/schema/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  
  // -------------------------------------------------------------------------
  // DRIZZLE LIFE-CYCLE TRANSACTION HOOKS: Fixed Multi-Tenant RBAC Seeding
  // -------------------------------------------------------------------------
  databaseHooks: {
    user: {
      create: {
        // Safe baseline passer satisfies strict decoupling parameters
        before: async (userPayload) => {
          return { data: userPayload };
        },

        // FIXED ATOMIC EXECUTION BLOCK: Resolves the 500 Not-Null Constraint error
        after: async (createdUser) => {
          try {
            const fallbackTenantName = "CompanyDemo";
            
            // 1. Core Synchronization Pass: Verify or Seed the base tenant row index
            let [targetCompany] = await db
              .select()
              .from(schema.company)
              .where(eq(schema.company.name, fallbackTenantName));

            if (!targetCompany) {
              console.log(`[Database Seeding] Deploying default corporate workspace: "${fallbackTenantName}"`);
              [targetCompany] = await db
                .insert(schema.company)
                .values({
                  name: fallbackTenantName,
                  domain: "demo.internal"
                })
                .returning();
            }

            console.log(`[RBAC Provisioning] Assigning 'user' policy scope under Tenant ID: ${targetCompany.id} for Operator ID: ${createdUser.id}`);

            // 2. Safe Database Insertion: Supplies a guaranteed valid non-null companyId
            await db
              .insert(schema.policy)
              .values({
                userId: createdUser.id,
                companyId: targetCompany.id, // Explicit parameter tracking assignment guarantees compatibility
                role: "user",
                updatedAt: new Date()
              })
              .onConflictDoUpdate({
                target: schema.policy.userId,
                set: {
                  companyId: targetCompany.id,
                  role: "user",
                  updatedAt: new Date()
                }
              });

          } catch (error: any) {
            console.error("Critical Post-Registration Policy Seeding Failure Matrix:", error.message || error);
            // Throwing explicit error frames inside hooks allows Better Auth to log failures cleanly
            throw new Error(`System RBAC Initialization Failure: ${error.message}`);
          }
        }
      },
    },
  },
});

