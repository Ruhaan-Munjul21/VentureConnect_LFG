import express, { type Express } from "express";

export function registerRoutes(app: Express): void {

  // Root endpoint for Railway health check
  app.get("/", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "VentureConnect API is running",
      timestamp: new Date().toISOString() 
    });
  });

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
} 