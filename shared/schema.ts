import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  password: varchar("password"), // for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleId: varchar("google_id"), // for Google OAuth
  authProvider: varchar("auth_provider").default("local"), // "local" or "google"
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  duration: integer("duration"), // in seconds
  fileSize: integer("file_size"), // in bytes
  views: integer("views").default(0),
  rating: text("rating").default("0"),
  genre: text("genre"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movieId: varchar("movie_id").references(() => movies.id),
  userId: varchar("user_id").references(() => users.id),
  watchTime: integer("watch_time"), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  status: text("status").notNull(), // pending, downloading, completed, failed
  progress: integer("progress").default(0), // percentage
  fileSize: integer("file_size"),
  downloadedSize: integer("downloaded_size").default(0),
  speed: text("speed"),
  eta: text("eta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  googleId: true,
  authProvider: true,
  isAdmin: true,
});

export const registerUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  googleId: true,
  authProvider: true,
  isAdmin: true,
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  filePath: true,
  thumbnailPath: true,
  duration: true,
  fileSize: true,
  genre: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  movieId: true,
  userId: true,
  watchTime: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  filename: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type Download = typeof downloads.$inferSelect;
