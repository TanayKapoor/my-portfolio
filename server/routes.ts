import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertWorkExperienceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Work Experience routes
  app.get("/api/work-experiences", async (req, res) => {
    try {
      const workExperiences = await storage.getAllWorkExperiences();
      res.json(workExperiences);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      res.status(500).json({ error: "Failed to fetch work experiences" });
    }
  });

  app.get("/api/work-experiences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const workExperience = await storage.getWorkExperience(id);
      
      if (!workExperience) {
        return res.status(404).json({ error: "Work experience not found" });
      }
      
      res.json(workExperience);
    } catch (error) {
      console.error("Error fetching work experience:", error);
      res.status(500).json({ error: "Failed to fetch work experience" });
    }
  });

  app.post("/api/work-experiences", async (req, res) => {
    try {
      const validatedData = insertWorkExperienceSchema.parse(req.body);
      const workExperience = await storage.createWorkExperience(validatedData);
      res.status(201).json(workExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid work experience data", details: error.errors });
      }
      console.error("Error creating work experience:", error);
      res.status(500).json({ error: "Failed to create work experience" });
    }
  });

  app.put("/api/work-experiences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertWorkExperienceSchema.partial().parse(req.body);
      const workExperience = await storage.updateWorkExperience(id, validatedData);
      
      if (!workExperience) {
        return res.status(404).json({ error: "Work experience not found" });
      }
      
      res.json(workExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid work experience data", details: error.errors });
      }
      console.error("Error updating work experience:", error);
      res.status(500).json({ error: "Failed to update work experience" });
    }
  });

  app.delete("/api/work-experiences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWorkExperience(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Work experience not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work experience:", error);
      res.status(500).json({ error: "Failed to delete work experience" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
