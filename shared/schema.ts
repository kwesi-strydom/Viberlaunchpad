import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(),
  teamName: text("team_name"),
  teammate: text("teammate"),
  teammateEmail: text("teammate_email"),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail_url: text("thumbnail_url"),
  game_url: text("game_url").notNull(),
  creator: text("creator"),
  submitted_by: text("submitted_by"), // Track who submitted (email/session)
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  game_id: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  session_id: text("session_id").notNull(),
  user_id: text("user_id"), // Associate with registered users for security
  ip_address: text("ip_address"), // Track IP for rate limiting
  user_agent: text("user_agent"), // Additional fingerprinting
  rating: integer("rating").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  userType: true,
  teamName: true,
  teammate: true,
  teammateEmail: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  created_at: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Session = typeof sessions.$inferSelect;
