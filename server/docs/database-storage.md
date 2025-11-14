# Database & Storage Layer Documentation

Complete guide to database schema, ORM usage, and storage layer implementation.

## Overview

**Database:** PostgreSQL (Neon Serverless)
**ORM:** Drizzle ORM
**Schema Validation:** Zod
**Connection:** WebSocket-based (via @neondatabase/serverless)

## Architecture

```
┌──────────────────┐
│   Routes Layer   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Storage Interface│ ← IStorage interface
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ DatabaseStorage  │ ← Implementation
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Drizzle ORM    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    PostgreSQL    │
│  (Neon Serverless)│
└──────────────────┘
```

---

## Database Connection

### File: `server/db.ts`

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle({ client: pool, schema });
```

**Key Features:**
- WebSocket-based connection for serverless compatibility
- Connection pooling for performance
- Schema-aware queries with TypeScript types

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User accounts & authentication | Username, email, password hash, admin flag |
| `projects` | Portfolio projects | Technologies, features, challenges, images |
| `workExperiences` | Work history | Position, company, duration, type |
| `commands` | Project-specific commands | Command, description, category, order |
| `newsletters` | Newsletter subscriptions | User link, preferences, active status |
| `contactEmails` | Contact form submissions | Email, source, timestamp |
| `sessions` | Session storage | Session ID, data, expiration |

---

### Users Table

```typescript
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Fields:**
- `id` - UUID primary key (auto-generated)
- `username` - Unique, max 50 chars
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `firstName`, `lastName` - Optional user names
- `profileImageUrl` - Optional profile picture
- `isAdmin` - Admin privileges flag
- `createdAt`, `updatedAt` - Automatic timestamps

**Constraints:**
- Unique username
- Unique email
- Non-null password

---

### Projects Table

```typescript
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
  iconName: text("icon_name"),
  iconUrl: text("icon_url"),
  heroImageUrl: text("hero_image_url"),
  screenshotUrls: text("screenshot_urls").array(),
  order: integer("order").notNull(),
  featured: boolean("featured").default(false),
});
```

**Array Fields:**
- `technologies` - Tech stack used
- `features` - Project features
- `challenges` - Challenges faced
- `results` - Project outcomes
- `screenshotUrls` - Multiple screenshots

**Image Fields:**
- `iconUrl` - Project icon/logo
- `heroImageUrl` - Hero/banner image
- `screenshotUrls` - Array of screenshot URLs

**Display Order:**
- `order` - Integer for sorting
- `featured` - Featured project flag

---

### Work Experiences Table

```typescript
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
```

**Key Fields:**
- `type` - "current" or "past" employment
- `description` - Array of bullet points
- `technologies` - Tech stack used
- `order` - Display order

---

### Commands Table

```typescript
export const commands = pgTable("commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  example: text("example"),
  tags: text("tags").array(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Features:**
- Foreign key to `projects` with cascade delete
- Categories: "Setup", "Development", "Deployment", "Testing"
- Optional usage examples
- Tagging system for filtering

---

### Newsletters Table

```typescript
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences"),
});
```

**Preferences JSON:**
```json
{
  "frequency": "weekly" | "monthly",
  "topics": ["string"]
}
```

---

### Contact Emails Table

```typescript
export const contactEmails = pgTable("contact_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  source: text("source").default("get_in_touch"),
});
```

**Source Field:**
- Tracks where email was submitted
- Default: "get_in_touch"
- Can be: "footer", "newsletter", "contact_form", etc.

---

### Sessions Table

```typescript
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
```

**Features:**
- Auto-managed by `connect-pg-simple`
- Indexed on expiration for cleanup
- Stores serialized session data

---

## Storage Layer

### File: `server/storage.ts`

### IStorage Interface

Defines contract for all storage operations:

```typescript
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: RegisterData & { password: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Session store
  sessionStore: any;

  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Work Experience methods
  getAllWorkExperiences(): Promise<WorkExperience[]>;
  getWorkExperience(id: string): Promise<WorkExperience | undefined>;
  createWorkExperience(workExperience: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: string, workExperience: Partial<InsertWorkExperience>): Promise<WorkExperience | undefined>;
  deleteWorkExperience(id: string): Promise<boolean>;

  // Command methods
  getCommandsByProject(projectId: string): Promise<Command[]>;
  getCommand(id: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: string, command: Partial<InsertCommand>): Promise<Command | undefined>;
  deleteCommand(id: string): Promise<boolean>;

  // Newsletter methods
  createUserAndSubscribe(userData: NewsletterSignupData & { password: string }): Promise<{ user: User; newsletter: Newsletter }>;
  subscribeToNewsletter(userId: string, preferences?: any): Promise<Newsletter>;
  unsubscribeFromNewsletter(userId: string): Promise<boolean>;
  getUserNewsletterSubscription(userId: string): Promise<Newsletter | undefined>;
  getAllNewsletterSubscriptions(): Promise<Newsletter[]>;

  // Contact email methods
  saveContactEmail(emailData: ContactEmailData): Promise<ContactEmail>;
  getAllContactEmails(): Promise<ContactEmail[]>;
}
```

---

### DatabaseStorage Implementation

#### User Operations

**Get User:**
```typescript
async getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || undefined;
}
```

**Upsert User (for OAuth):**
```typescript
async upsertUser(userData: UpsertUser): Promise<User> {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}
```

---

#### Project Operations

**Get All Projects (Ordered):**
```typescript
async getAllProjects(): Promise<Project[]> {
  return await db.select().from(projects).orderBy(asc(projects.order));
}
```

**Update Project:**
```typescript
async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
  const [project] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))
    .returning();
  return project || undefined;
}
```

**Delete Project:**
```typescript
async deleteProject(id: string): Promise<boolean> {
  const result = await db.delete(projects).where(eq(projects.id, id));
  return (result.rowCount ?? 0) > 0;
}
```

---

#### Newsletter Operations

**Create User and Subscribe (Transaction):**
```typescript
async createUserAndSubscribe(userData: NewsletterSignupData & { password: string }): Promise<{ user: User; newsletter: Newsletter }> {
  // Create user
  const [user] = await db
    .insert(users)
    .values({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: false,
    })
    .returning();

  // Subscribe to newsletter
  const [newsletter] = await db
    .insert(newsletters)
    .values({
      userId: user.id,
      preferences: userData.preferences || { frequency: "monthly", topics: [] },
      isActive: true,
    })
    .returning();

  return { user, newsletter };
}
```

**Unsubscribe (Soft Delete):**
```typescript
async unsubscribeFromNewsletter(userId: string): Promise<boolean> {
  const result = await db
    .update(newsletters)
    .set({ isActive: false })
    .where(eq(newsletters.userId, userId));
  return (result.rowCount ?? 0) > 0;
}
```

---

## Zod Validation Schemas

### Insert Schemas

Auto-generated from Drizzle schemas:

```typescript
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
```

### Custom Schemas

**Login:**
```typescript
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

**Register:**
```typescript
export const registerSchema = loginSchema.extend({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
```

**Newsletter Signup:**
```typescript
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
```

---

## Database Migrations

### Drizzle Kit Configuration

**File:** `drizzle.config.ts`

```typescript
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

### Pushing Schema Changes

```bash
npm run db:push
```

This will:
1. Read schema from `shared/schema.ts`
2. Compare with current database
3. Generate and execute SQL to sync
4. No migration files needed (uses push mode)

### Generating Migrations (Alternative)

```bash
npx drizzle-kit generate
```

This creates migration files in `./migrations/` directory.

---

## Type Safety

### Drizzle ORM Types

All database operations are fully typed:

```typescript
// Return type is inferred as Project[]
const projects = await db.select().from(projects);

// Type error if field doesn't exist
await db.select().from(users).where(eq(users.invalidField, "test"));
```

### Zod Runtime Validation

```typescript
const validatedData = insertProjectSchema.parse(req.body);
// validatedData is typed as InsertProject
```

---

## Query Patterns

### Select with Where

```typescript
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, "user@example.com"));
```

### Insert with Returning

```typescript
const [newProject] = await db
  .insert(projects)
  .values(projectData)
  .returning();
```

### Update with Returning

```typescript
const [updated] = await db
  .update(projects)
  .set({ title: "New Title" })
  .where(eq(projects.id, projectId))
  .returning();
```

### Ordered Select

```typescript
const experiences = await db
  .select()
  .from(workExperiences)
  .orderBy(asc(workExperiences.order));
```

### Foreign Key Query

```typescript
const commands = await db
  .select()
  .from(commands)
  .where(eq(commands.projectId, projectId))
  .orderBy(asc(commands.order));
```

---

## Error Handling

### Database Errors

```typescript
try {
  const project = await storage.createProject(data);
  res.json(project);
} catch (error) {
  console.error("Database error:", error);
  res.status(500).json({ error: "Failed to create project" });
}
```

### Validation Errors

```typescript
try {
  const validated = insertProjectSchema.parse(req.body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: error.errors
    });
  }
}
```

---

## Best Practices

### Use Storage Layer

✅ **Do:**
```typescript
const project = await storage.getProject(id);
```

❌ **Don't:**
```typescript
const [project] = await db.select().from(projects).where(eq(projects.id, id));
```

### Always Validate Input

✅ **Do:**
```typescript
const validated = insertProjectSchema.parse(req.body);
await storage.createProject(validated);
```

❌ **Don't:**
```typescript
await storage.createProject(req.body);
```

### Handle Undefined Returns

✅ **Do:**
```typescript
const project = await storage.getProject(id);
if (!project) {
  return res.status(404).json({ error: "Not found" });
}
```

---

## Database Administration

### View Tables

```bash
psql $DATABASE_URL
\dt
```

### Create First Admin

```sql
UPDATE users
SET "isAdmin" = true
WHERE email = 'admin@example.com';
```

### Reset Database

```bash
# Careful: This deletes all data
npx drizzle-kit drop
npm run db:push
```

---

## Performance Considerations

- Connection pooling enabled by default
- Indexes on session expiration
- Foreign keys with cascade delete
- Efficient ordering queries
- WebSocket connections for low latency

---

## Future Enhancements

- Add database indexes for frequently queried fields
- Implement soft deletes for projects/work experiences
- Add full-text search capabilities
- Implement data archiving strategy
- Add database backups automation
- Consider read replicas for scaling
