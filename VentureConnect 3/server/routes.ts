import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSignupSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Waitlist signup endpoint
  app.post("/api/waitlist", async (req, res) => {
    try {
      const validatedData = insertWaitlistSignupSchema.parse(req.body);
      const signup = await storage.addToWaitlist(validatedData);
      res.json({ success: true, message: "Successfully added to waitlist", signup });
    } catch (error) {
      if (error instanceof Error && error.message === "Email already registered for waitlist") {
        res.status(409).json({ success: false, message: "Email already registered for waitlist" });
      } else {
        res.status(400).json({ success: false, message: "Invalid email address" });
      }
    }
  });

  // Get waitlist count
  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const count = await storage.getWaitlistCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get waitlist count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
