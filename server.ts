import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database("data.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads with security checks
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const id = req.body.id;
      // Sanitize ID to prevent path traversal
      const safeId = id.replace(/[^a-z0-9_-]/gi, '_');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${safeId}${ext}`);
    }
  });

  const upload = multer({ 
    storage,
    limits: {
      fileSize: 300 * 1024 * 1024, // 300MB limit for images/media
    },
    fileFilter: (req, file, cb) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mp3', '.wav'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de arquivo não permitido"));
      }
    }
  });

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // API route to handle image/media uploads
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // API route to get all uploaded media mappings
  app.get("/api/media", (req, res) => {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({});
    }
    const files = fs.readdirSync(uploadsDir);
    const mapping: Record<string, string> = {};
    files.forEach(file => {
      const id = path.parse(file).name;
      mapping[id] = `/uploads/${file}`;
    });
    res.json(mapping);
  });

  // API routes for content persistence
  app.get("/api/content/:key", (req, res) => {
    const row = db.prepare("SELECT value FROM content WHERE key = ?").get(req.params.key) as { value: string } | undefined;
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/content/:key", (req, res) => {
    const { value } = req.body;
    db.prepare("INSERT OR REPLACE INTO content (key, value) VALUES (?, ?)").run(req.params.key, JSON.stringify(value));
    res.json({ success: true });
  });

  // API route to reset all uploads and content
  app.post("/api/reset", (req, res) => {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }
    db.prepare("DELETE FROM content").run();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
