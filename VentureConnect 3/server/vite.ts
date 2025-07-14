import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express) {
  const serverOptions = {
    middlewareMode: true,
    allowedHosts: true as const,
  };
  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    // Skip API routes - let Express handle them
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      // Safety check for process.cwd() - fallback to /app for Railway
      const cwd = process.cwd() || "/app";
      const clientTemplate = path.resolve(
        cwd,
        "client",
        "index.html",
      );
      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Safety check for process.cwd() - fallback to /app for Railway
  const cwd = process.cwd() || "/app";
  const distPath = path.resolve(cwd, "dist", "public");
  
  console.log(`🔍 Looking for dist directory at: ${distPath}`);
  console.log(`📁 Current working directory: ${cwd}`);
  
  if (!fs.existsSync(distPath)) {
    console.warn(`Static files not found at ${distPath}, serving minimal fallback`);
    
    // Serve a simple fallback instead of crashing
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>VentureConnect</title></head>
          <body>
            <h1>VentureConnect Loading...</h1>
            <p>Static files not found. Check build process.</p>
          </body>
        </html>
      `);
    });
    return;
  }
  
  console.log("Static files found:", fs.readdirSync(distPath));
  
  // Serve static files with cache-busting headers
  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  
  // SPA fallback with cache-busting headers
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(500).send("Frontend build incomplete");
    }
    
    // Add cache-busting headers for HTML files
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.sendFile(indexPath);
  });
}