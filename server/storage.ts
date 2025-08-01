import { users, projects, workExperiences, type User, type UpsertUser, type Project, type InsertProject, type WorkExperience, type InsertWorkExperience, type RegisterData } from "@shared/schema";
import { db } from "./db";
import { eq, asc, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations for internal authentication
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
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: RegisterData & { password: string }): Promise<User> {
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
    return user;
  }

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

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.order));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllWorkExperiences(): Promise<WorkExperience[]> {
    return await db.select().from(workExperiences).orderBy(asc(workExperiences.order));
  }

  async getWorkExperience(id: string): Promise<WorkExperience | undefined> {
    const [workExperience] = await db.select().from(workExperiences).where(eq(workExperiences.id, id));
    return workExperience || undefined;
  }

  async createWorkExperience(insertWorkExperience: InsertWorkExperience): Promise<WorkExperience> {
    const [workExperience] = await db
      .insert(workExperiences)
      .values(insertWorkExperience)
      .returning();
    return workExperience;
  }

  async updateWorkExperience(id: string, updateData: Partial<InsertWorkExperience>): Promise<WorkExperience | undefined> {
    const [workExperience] = await db
      .update(workExperiences)
      .set(updateData)
      .where(eq(workExperiences.id, id))
      .returning();
    return workExperience || undefined;
  }

  async deleteWorkExperience(id: string): Promise<boolean> {
    const result = await db.delete(workExperiences).where(eq(workExperiences.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
