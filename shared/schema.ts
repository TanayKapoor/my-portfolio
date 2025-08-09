import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for internal authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false), // Admin role flag
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  iconUrl: text("icon_url"), // Store uploaded project icon URL
  heroImageUrl: text("hero_image_url"), // Store uploaded hero image for project cards
  screenshotUrls: text("screenshot_urls").array(), // Store uploaded screenshot URLs
  order: integer("order").notNull(),
  featured: boolean("featured").default(false),
});

export const workExperiences = pgTable("work_experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  position: text("position").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description").array().notNull(),
  technologies: text("technologies").array().notNull(),
  type: text("type").notNull(), // "current" or "past"
  order: integer("order").notNull(),
});

export const commands = pgTable("commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Setup", "Development", "Deployment", "Testing"
  example: text("example"), // Optional usage example
  tags: text("tags").array(), // Optional tags for filtering
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences"), // Store newsletter preferences like frequency, topics, etc.
});

export const contactEmails = pgTable("contact_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  source: text("source").default("get_in_touch"), // Source of the email (e.g., "get_in_touch", "footer", etc.)
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertWorkExperienceSchema = createInsertSchema(workExperiences).omit({
  id: true,
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true,
});

export const insertContactEmailSchema = createInsertSchema(contactEmails).omit({
  id: true,
  submittedAt: true,
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = loginSchema.extend({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const newsletterSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferences: z.object({
    frequency: z.enum(["weekly", "monthly"]).default("monthly"),
    topics: z.array(z.string()).default([]),
  }).optional(),
});

export const contactEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional().default("get_in_touch"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type WorkExperience = typeof workExperiences.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commands.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertContactEmail = z.infer<typeof insertContactEmailSchema>;
export type ContactEmail = typeof contactEmails.$inferSelect;
export type ContactEmailData = z.infer<typeof contactEmailSchema>;
