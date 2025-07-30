import { users, projects, workExperiences, type User, type InsertUser, type Project, type InsertProject, type WorkExperience, type InsertWorkExperience } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
