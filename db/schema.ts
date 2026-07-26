import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const progressUpdates = sqliteTable("progress_updates", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  energy: integer("energy").notNull(),
  note: text("note").notNull().default(""),
  breakthrough: integer("breakthrough", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminCredentials = sqliteTable("admin_credentials", {
  username: text("username").primaryKey(),
  passwordSalt: text("password_salt").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordIterations: integer("password_iterations").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
