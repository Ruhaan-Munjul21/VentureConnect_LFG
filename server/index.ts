import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  try {
    // Register routes on the app
    registerRoutes(app);
    console.log("Routes registered successfully");
    
    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Error middleware triggered:", err);
    });
    
    // Setup Vite in development or serve static files in production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app);
    } else {
      console.log("Setting up static file serving for production");
      serveStatic(app);
    }
    
    // Use Railway's PORT, fallback to 8080
    const port = parseInt(process.env.PORT || "8080");
    const host = "0.0.0.0"; // CRITICAL: Must be 0.0.0.0 for Railway
    
    console.log(`Starting server on ${host}:${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT from env: ${process.env.PORT}`);
    
    // Create server and listen
    const server = createServer(app);
    
    server.listen(port, host, () => {
      console.log(`✅ Server successfully listening on ${host}:${port}`);
      console.log(`🚀 App should be accessible at your Railway URL`);
    });
    
    // Add error handling for server
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });
    
    // Log incoming requests for debugging
    app.use((req, res, next) => {
      console.log(`📨 Incoming request: ${req.method} ${req.path}`);
      next();
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();