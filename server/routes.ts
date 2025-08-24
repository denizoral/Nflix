import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema, insertDownloadSchema, insertAnalyticsSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import https from "https";
import { URL } from "url";

// Extend Express Request type for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Download function for URL downloads
async function startDownloadProcess(downloadId: string, url: string) {
  try {
    const parsedUrl = new URL(url);
    const fileName = path.basename(parsedUrl.pathname) || 'downloaded_video.mp4';
    const filePath = path.join(process.env.MOVIES_DIRECTORY || './movies', fileName);
    
    await storage.updateDownload(downloadId, { 
      status: "downloading", 
      progress: 0,
      speed: "Connecting...",
      eta: "Calculating..."
    });

    const request = https.get(url, (response) => {
      const fileSize = parseInt(response.headers['content-length'] || '0', 10);
      const fileStream = fs.createWriteStream(filePath);
      let downloadedSize = 0;
      const startTime = Date.now();

      response.pipe(fileStream);

      response.on('data', async (chunk) => {
        downloadedSize += chunk.length;
        const progress = Math.round((downloadedSize / fileSize) * 100);
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = downloadedSize / elapsed;
        const remaining = (fileSize - downloadedSize) / speed;
        
        await storage.updateDownload(downloadId, {
          progress,
          downloadedSize,
          fileSize,
          speed: `${(speed / (1024 * 1024)).toFixed(2)} MB/s`,
          eta: `${Math.round(remaining)}s`
        });
      });

      fileStream.on('finish', async () => {
        await storage.updateDownload(downloadId, { 
          status: "completed", 
          progress: 100,
          speed: "Completed",
          eta: "Done"
        });

        // Create movie entry for downloaded file
        await storage.createMovie({
          title: path.basename(fileName, path.extname(fileName)),
          filePath: filePath,
          fileSize: fileSize,
          duration: null,
          description: `Downloaded from: ${url}`,
          genre: null,
        });
      });

      fileStream.on('error', async () => {
        await storage.updateDownload(downloadId, { status: "failed" });
      });
    });

    request.on('error', async () => {
      await storage.updateDownload(downloadId, { status: "failed" });
    });

  } catch (error) {
    await storage.updateDownload(downloadId, { status: "failed" });
  }
}

// Configure multer for file uploads with proper storage handling
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const contentType = req.body.contentType || 'movies';
    const baseDir = process.env.MOVIES_DIRECTORY || './uploads';
    const targetDir = path.join(baseDir, contentType);
    
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename, handle duplicates by adding timestamp if needed
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    
    // Clean filename to avoid issues
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalName = `${cleanBaseName}${ext}`;
    
    cb(null, finalName);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 * 1024, // 50GB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /\.(mp4|avi|mkv|mov|wmv|flv|webm)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

// Admin authentication middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization check failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  
  // Movie routes (public)
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/scan", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const movies = await storage.scanMovieDirectory();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to scan movie directory" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Admin-only movie management routes
  app.post("/api/movies", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error) {
      res.status(400).json({ message: "Invalid movie data" });
    }
  });

  app.put("/api/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const movie = await storage.updateMovie(req.params.id, req.body);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete("/api/movies/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteMovie(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  app.post("/api/movies/:id/view", async (req, res) => {
    try {
      await storage.incrementViews(req.params.id);
      res.status(200).json({ message: "View recorded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Video streaming route
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie || !fs.existsSync(movie.filePath)) {
        return res.status(404).json({ message: "Video file not found" });
      }

      const stat = fs.statSync(movie.filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(movie.filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(movie.filePath).pipe(res);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  // Admin-only file upload route
  app.post("/api/upload", isAuthenticated, isAdmin, upload.single('video'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const contentType = req.body.contentType || 'movies';
      const filePath = req.file.path; // multer already saved it with the correct name
      const fileName = req.file.filename; // this is the cleaned filename we set
      const originalName = req.file.originalname;
      
      // Extract title from filename
      const title = path.basename(originalName, path.extname(originalName));
      
      const movie = await storage.createMovie({
        title: title,
        filePath: filePath,
        fileSize: req.file.size,
        duration: null, // Will be determined later or by user
        description: `Uploaded ${contentType.slice(0, -1)}: ${originalName}`,
        genre: contentType === 'tv-shows' ? 'TV Show' : null, // Mark TV shows
      });

      res.status(201).json(movie);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Admin-only analytics routes
  app.get("/api/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  app.get("/api/analytics/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const movies = await storage.getPopularMovies(limit);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular movies" });
    }
  });

  app.get("/api/analytics/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const totalMovies = (await storage.getMovies()).length;
      const totalViews = await storage.getTotalViews();
      const downloads = await storage.getDownloads();
      
      // Calculate actual storage used
      const allMovies = await storage.getMovies();
      const totalStorageBytes = allMovies.reduce((total, movie) => total + (movie.fileSize || 0), 0);
      const storageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
      
      const stats = {
        totalMovies,
        totalViews,
        activeDownloads: downloads.filter(d => d.status === 'downloading').length,
        completedDownloads: downloads.filter(d => d.status === 'completed').length,
        storageUsed: `${storageGB} GB`,
        activeUsers: 1, // Could be tracked with real session management
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin-only download routes
  app.get("/api/downloads", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const downloads = await storage.getDownloads();
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  app.post("/api/downloads", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const downloadData = insertDownloadSchema.parse(req.body);
      const download = await storage.createDownload(downloadData);
      
      // Start actual download process
      startDownloadProcess(download.id, downloadData.url);
      
      res.status(201).json(download);
    } catch (error) {
      res.status(400).json({ message: "Invalid download data" });
    }
  });

  app.delete("/api/downloads/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteDownload(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Download not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete download" });
    }
  });

  // Admin route to promote users to admin status
  app.post("/api/admin/promote", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.upsertUser({
        ...user,
        isAdmin: true
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
