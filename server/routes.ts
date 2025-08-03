import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertProjectSchema, insertWorkExperienceSchema, insertCommandSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, requireAuth, requireAdmin } from "./auth";

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);
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

  app.post("/api/projects", requireAdmin, async (req, res) => {
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

  app.put("/api/projects/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/work-experiences", requireAdmin, async (req, res) => {
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

  app.put("/api/work-experiences/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/work-experiences/:id", requireAdmin, async (req, res) => {
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

  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // File upload routes
  app.post("/api/projects/:id/upload-icon", requireAdmin, upload.single('icon'), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: "No icon file provided" });
      }

      const iconUrl = `/uploads/${req.file.filename}`;
      const project = await storage.updateProject(id, { iconUrl });
      
      if (!project) {
        // Clean up uploaded file if project not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json({ iconUrl, project });
    } catch (error) {
      console.error("Error uploading project icon:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload project icon" });
    }
  });

  app.post("/api/projects/:id/upload-hero", requireAdmin, upload.single('hero'), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: "No hero image file provided" });
      }

      const heroImageUrl = `/uploads/${req.file.filename}`;
      const project = await storage.updateProject(id, { heroImageUrl });
      
      if (!project) {
        // Clean up uploaded file if project not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json({ heroImageUrl, project });
    } catch (error) {
      console.error("Error uploading project hero image:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload project hero image" });
    }
  });

  app.post("/api/projects/:id/upload-screenshots", requireAdmin, upload.array('screenshots', 10), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No screenshot files provided" });
      }

      const screenshotUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Get current project to append to existing screenshots
      const currentProject = await storage.getProject(id);
      if (!currentProject) {
        // Clean up uploaded files if project not found
        req.files.forEach(file => fs.unlinkSync(file.path));
        return res.status(404).json({ error: "Project not found" });
      }

      const existingScreenshots = currentProject.screenshotUrls || [];
      const updatedScreenshots = [...existingScreenshots, ...screenshotUrls];
      
      const project = await storage.updateProject(id, { screenshotUrls: updatedScreenshots });
      
      res.json({ screenshotUrls, project });
    } catch (error) {
      console.error("Error uploading project screenshots:", error);
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      res.status(500).json({ error: "Failed to upload project screenshots" });
    }
  });

  app.delete("/api/projects/:id/screenshots/:screenshotIndex", requireAdmin, async (req, res) => {
    try {
      const { id, screenshotIndex } = req.params;
      const index = parseInt(screenshotIndex);
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const screenshots = project.screenshotUrls || [];
      if (index < 0 || index >= screenshots.length) {
        return res.status(400).json({ error: "Invalid screenshot index" });
      }

      // Delete file from disk
      const screenshotUrl = screenshots[index];
      const filePath = path.join(process.cwd(), screenshotUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Remove from array
      const updatedScreenshots = screenshots.filter((_, i) => i !== index);
      const updatedProject = await storage.updateProject(id, { screenshotUrls: updatedScreenshots });
      
      res.json({ project: updatedProject });
    } catch (error) {
      console.error("Error deleting project screenshot:", error);
      res.status(500).json({ error: "Failed to delete project screenshot" });
    }
  });

  // Delete all screenshots for a project
  app.delete("/api/projects/:id/screenshots", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const screenshots = project.screenshotUrls || [];
      
      // Delete all files from disk
      screenshots.forEach(screenshotUrl => {
        const filePath = path.join(process.cwd(), screenshotUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Clear the screenshots array
      const updatedProject = await storage.updateProject(id, { screenshotUrls: [] });
      
      res.json({ project: updatedProject });
    } catch (error) {
      console.error("Error deleting all project screenshots:", error);
      res.status(500).json({ error: "Failed to delete all project screenshots" });
    }
  });

  app.put("/api/projects/:id/reorder-screenshots", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { screenshotUrls } = req.body;

      if (!Array.isArray(screenshotUrls)) {
        return res.status(400).json({ error: "screenshotUrls must be an array" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Validate that all provided URLs exist in the current project
      const currentScreenshots = project.screenshotUrls || [];
      const isValidReorder = screenshotUrls.length === currentScreenshots.length &&
        screenshotUrls.every(url => currentScreenshots.includes(url));

      if (!isValidReorder) {
        return res.status(400).json({ error: "Invalid screenshot reorder: URLs must match existing screenshots" });
      }

      const updatedProject = await storage.updateProject(id, { screenshotUrls });
      
      res.json({ project: updatedProject });
    } catch (error) {
      console.error("Error reordering project screenshots:", error);
      res.status(500).json({ error: "Failed to reorder project screenshots" });
    }
  });

  // Command routes (project-specific)
  app.get("/api/projects/:projectId/commands", async (req, res) => {
    try {
      const { projectId } = req.params;
      const commands = await storage.getCommandsByProject(projectId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching commands:", error);
      res.status(500).json({ error: "Failed to fetch commands" });
    }
  });

  app.get("/api/commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const command = await storage.getCommand(id);
      
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      res.json(command);
    } catch (error) {
      console.error("Error fetching command:", error);
      res.status(500).json({ error: "Failed to fetch command" });
    }
  });

  app.post("/api/projects/:projectId/commands", requireAdmin, async (req, res) => {
    try {
      const { projectId } = req.params;
      const validatedData = insertCommandSchema.parse({
        ...req.body,
        projectId
      });
      const command = await storage.createCommand(validatedData);
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid command data", details: error.errors });
      }
      console.error("Error creating command:", error);
      res.status(500).json({ error: "Failed to create command" });
    }
  });

  app.put("/api/commands/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCommandSchema.partial().parse(req.body);
      const command = await storage.updateCommand(id, validatedData);
      
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      res.json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid command data", details: error.errors });
      }
      console.error("Error updating command:", error);
      res.status(500).json({ error: "Failed to update command" });
    }
  });

  app.delete("/api/commands/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCommand(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting command:", error);
      res.status(500).json({ error: "Failed to delete command" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Admin status check endpoint
  app.get("/api/admin-status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user as any;
    res.json({ isAdmin: user.isAdmin || false });
  });

  const httpServer = createServer(app);

  return httpServer;
}
