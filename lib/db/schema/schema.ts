import { pgTable, text, timestamp, boolean, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm" ;


/* =========================================================================
   1. CORE ORGANIZATION TENANT SCHEMA
   ========================================================================= */
export const company = pgTable("company", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================================
   2. AUTHENTICATED SYSTEM OPERATOR SCHEMA (Completely Independent)
   ========================================================================= */
export const user = pgTable("user", {
  id: text("id").primaryKey(), // String key generated via Better Auth v1.6.25
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/* =========================================================================
   3. ROLE-BASED ACCESS CONTROL (RBAC) POLICY LAYOUT SCHEMA (WIRED TO COMPANY)
   ========================================================================= */
export const policy = pgTable("policy", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique() // Hard database 1-to-1 unique layout constraint index per user
    .references(() => user.id, { onDelete: "cascade" }),
    
  // FIXED RELATIONSHIP: Roles and permissions are explicitly bound to a corporate tenant node
  companyId: uuid("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }), // Wipes permissions if company is removed
    
  role: varchar("role", { length: 50 }).default("user").notNull(), // guest, user, superuser, admin
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================================
   4. API MANAGEMENT ENDPOINT REGISTRY RULES (Normalized to User Only)
   ========================================================================= */
export const endpoints = pgTable("endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 512 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE
  description: text("description"),
  mockBody: text("mock_body"), // Persists unformatted raw JSON body string fields
  
  // Track individual author context (1 User -> Many Endpoints)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), 
    
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



/* =========================================================================
   5. DRIZZLE KIT RELATION CONFIGURATION OBJECTS
   ========================================================================= */

// --- FIXED: 1 Company has MANY Policies (1-to-Many Relationship) ---
export const companyRelations = relations(company, ({ many }) => ({
  policies: many(policy),
}));

// --- FIXED: 1 User owns ONE Policy profile and authors MANY Endpoints ---
export const userRelations = relations(user, ({ one, many }) => ({
  policy: one(policy), // 1-to-1 Mapping to privilege parameters profile card
  endpoints: many(endpoints), // 1 User authored Many Endpoints
}));

// --- FIXED: Policy belongs upward to exactly ONE Company and ONE User ---
export const policyRelations = relations(policy, ({ one }) => ({
  accountHolder: one(user, {
    fields: [policy.userId],
    references: [user.id],
  }), // Many-to-One link mapping back to user
  company: one(company, {
    fields: [policy.companyId],
    references: [company.id],
  }), // Many-to-One link mapping directly back to corporate tenant
}));

// --- BACKWARD MAPPINGS ENDPOINTS TO AUTHOR RECONCILIATION ---
export const endpointsRelations = relations(endpoints, ({ one }) => ({
  author: one(user, {
    fields: [endpoints.userId],
    references: [user.id],
  }), 
}));

//   for  useApiStore call
export type Endpoint = typeof endpoints.$inferSelect;
export type User = typeof user.$inferSelect;


/* =========================================================================
   6. BETTER AUTH COMPATIBILITY SKELETON CONFIGURATIONS
   ========================================================================= */

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id") .notNull() .references(() => user.id, { onDelete: "cascade" }),
});


export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id") .notNull() .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
