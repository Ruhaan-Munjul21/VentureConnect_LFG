import express, { type Express } from "express";
import { createServer, type Server } from "http";
import adminRoutes from "./admin";
import clientRoutes from "./client";

export function registerRoutes(app: Express): Server {
  // Register admin routes
  app.use("/api/admin", adminRoutes);

  // Register client routes
  app.use("/api/client", clientRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Startup application submission endpoint
  app.post("/api/applications", (req, res) => {
    try {
      const applicationData = req.body;
      
      // In a real app, you'd save this to your database
      console.log("New application received:", applicationData);
      
      res.json({
        success: true,
        message: "Application submitted successfully",
        id: Date.now().toString() // Mock ID
      });
    } catch (error) {
      console.error("Error processing application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit application"
      });
    }
  });

  // Create HTTP server
  const server = createServer(app);

  return server;
}
