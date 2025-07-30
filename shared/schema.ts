import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  duration: text("duration"),
  role: text("role"),
  status: text("status"),
  technologies: text("technologies").array().notNull(),
  features: text("features").array().notNull(),
  challenges: text("challenges").array().notNull(),
  results: text("results").array().notNull(),
  demoUrl: text("demo_url"),
  githubUrl: text("github_url"),
  colorTheme: text("color_theme").notNull(),
  iconName: text("icon_name"), // Store icon name for lucide-react icons
  order: integer("order").notNull(),
  featured: boolean("featured").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
