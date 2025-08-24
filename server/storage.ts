import { 
  type User, 
  type InsertUser, 
  type UpsertUser,
  type Movie, 
  type InsertMovie, 
  type Analytics, 
  type InsertAnalytics, 
  type Download, 
  type InsertDownload,
  users,
  movies,
  analytics,
  downloads
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User methods  
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Movie methods
  getMovies(): Promise<Movie[]>;
  getMovie(id: string): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, movie: Partial<Movie>): Promise<Movie | undefined>;
  deleteMovie(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  
  // Analytics methods
  getAnalytics(): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getPopularMovies(limit?: number): Promise<Movie[]>;
  getTotalViews(): Promise<number>;
  
  // Download methods
  getDownloads(): Promise<Download[]>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: string, download: Partial<Download>): Promise<Download | undefined>;
  deleteDownload(id: string): Promise<boolean>;
  
  // File system methods
  scanMovieDirectory(): Promise<Movie[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default admin user if needed
    this.ensureAdminUser();
  }

  private async ensureAdminUser() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        await this.createUser({
          username: "admin",
          email: "admin@dotbyte.app",
          password: "$2a$10$gKW/zHW5.dXQ1C8L2HyKX.U0gKxWx1iVJXJBnYqY4Y4Cb2LU2cNyC", // hashed "admin123"
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: null,
          authProvider: "local",
          isAdmin: true
        });
      }
    } catch (error) {
      // Admin user creation will be handled later
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isAdmin: insertUser.isAdmin ?? false
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovie(id: string): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db
      .insert(movies)
      .values({
        ...insertMovie,
        views: 0,
        rating: "0"
      })
      .returning();
    return movie;
  }

  async updateMovie(id: string, movieUpdate: Partial<Movie>): Promise<Movie | undefined> {
    const [movie] = await db
      .update(movies)
      .set(movieUpdate)
      .where(eq(movies.id, id))
      .returning();
    return movie;
  }

  async deleteMovie(id: string): Promise<boolean> {
    const result = await db.delete(movies).where(eq(movies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViews(id: string): Promise<void> {
    await db
      .update(movies)
      .set({ views: sql`${movies.views} + 1` })
      .where(eq(movies.id, id));
  }

  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics);
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsRecord;
  }

  async getPopularMovies(limit: number = 10): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .orderBy(desc(movies.views))
      .limit(limit);
  }

  async getTotalViews(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${movies.views})` })
      .from(movies);
    return result[0]?.total || 0;
  }

  async getDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).orderBy(desc(downloads.createdAt));
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const [download] = await db
      .insert(downloads)
      .values({
        ...insertDownload,
        status: "pending",
        progress: 0,
        downloadedSize: 0
      })
      .returning();
    return download;
  }

  async updateDownload(id: string, downloadUpdate: Partial<Download>): Promise<Download | undefined> {
    const [download] = await db
      .update(downloads)
      .set(downloadUpdate)
      .where(eq(downloads.id, id))
      .returning();
    return download;
  }

  async deleteDownload(id: string): Promise<boolean> {
    const result = await db.delete(downloads).where(eq(downloads.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async scanMovieDirectory(): Promise<Movie[]> {
    const moviesDir = process.env.MOVIES_DIRECTORY || './movies';
    
    try {
      if (!fs.existsSync(moviesDir)) {
        fs.mkdirSync(moviesDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(moviesDir);
      const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'];
      
      const movieFiles = files.filter(file => 
        videoExtensions.some(ext => file.toLowerCase().endsWith(ext))
      );

      const discoveredMovies: Movie[] = [];
      
      for (const file of movieFiles) {
        const filePath = path.join(moviesDir, file);
        const stats = fs.statSync(filePath);
        const title = path.basename(file, path.extname(file));
        
        // Check if movie already exists in database
        const existingMovies = await this.getMovies();
        const existingMovie = existingMovies.find(m => m.filePath === filePath);
        if (existingMovie) {
          discoveredMovies.push(existingMovie);
          continue;
        }

        const movie = await this.createMovie({
          title,
          filePath,
          fileSize: stats.size,
          duration: null,
          description: `Auto-discovered: ${title}`,
          genre: null,
        });
        
        discoveredMovies.push(movie);
      }
      
      return discoveredMovies;
    } catch (error) {
      console.error('Error scanning movie directory:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
