import { users, games, ratings, sessions, type User, type InsertUser, type Game, type InsertGame, type Rating, type InsertRating, type Session } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Games
  getAllGames(): Promise<Array<Game & { avg_rating: number; rating_count: number }>>;
  getAllPublicGames(): Promise<Array<Pick<Game, 'id' | 'title' | 'description' | 'thumbnail_url' | 'creator' | 'created_at'>>>;
  getGame(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(gameId: string, game: Partial<InsertGame>): Promise<Game>;
  getGameByCreator(creator: string): Promise<Game | undefined>;
  
  // Ratings
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  getRatingBySessionAndGame(sessionId: string, gameId: string): Promise<Rating | undefined>;
  getRatingsBySession(sessionId: string): Promise<Rating[]>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  getRatingByUserAndGame(userId: number, gameId: string): Promise<Rating | undefined>;
  
  // Sessions
  createSession(sessionId: string, userId: number, expiresAt: Date): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<string, Game>;
  private ratings: Map<string, Rating>;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.ratings = new Map();
    this.currentUserId = 1;
    
    // Add sample games for development
    this.seedData();
  }

  private seedData() {
    const sampleGames: Game[] = [
      {
        id: '1',
        created_at: new Date(),
        title: 'Space Invaders 2.0',
        description: 'A modern take on the classic game.',
        thumbnail_url: 'https://placehold.co/400x300/9333ea/ffffff?text=Space+Invaders',
        game_url: 'https://example.com/space-invaders',
        creator: 'AI Developer'
      },
      {
        id: '2',
        created_at: new Date(),
        title: 'Pixel Platformer',
        description: 'Jump and run through colorful pixel worlds.',
        thumbnail_url: 'https://placehold.co/400x300/3b82f6/ffffff?text=Pixel+Platformer',
        game_url: 'https://claude.ai/public/artifacts/ad55d2d6-8a0c-499e-b674-5edd4ce4859e',
        creator: 'RetroAI'
      }
    ];
    
    sampleGames.forEach(game => this.games.set(game.id, game));
    
    // Add sample ratings
    const sampleRatings: Rating[] = [
      {
        id: 'r1',
        game_id: '1',
        session_id: 'session1',
        rating: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'r2',
        game_id: '1',
        session_id: 'session2',
        rating: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'r3',
        game_id: '2',
        session_id: 'session3',
        rating: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    sampleRatings.forEach(rating => this.ratings.set(rating.id, rating));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllGames(): Promise<Array<Game & { avg_rating: number; rating_count: number }>> {
    const gamesArray = Array.from(this.games.values());
    
    return gamesArray.map(game => {
      const gameRatings = Array.from(this.ratings.values()).filter(r => r.game_id === game.id);
      const avg_rating = gameRatings.length > 0 
        ? gameRatings.reduce((sum, r) => sum + r.rating, 0) / gameRatings.length
        : 0;
      const rating_count = gameRatings.length;
      
      return { ...game, avg_rating, rating_count };
    });
  }

  async getAllPublicGames(): Promise<Array<Pick<Game, 'id' | 'title' | 'description' | 'thumbnail_url' | 'creator' | 'created_at'>>> {
    const gamesArray = Array.from(this.games.values());
    
    return gamesArray
      .map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        thumbnail_url: game.thumbnail_url,
        creator: game.creator,
        created_at: game.created_at
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = crypto.randomUUID();
    const game: Game = {
      ...insertGame,
      id,
      created_at: new Date(),
      thumbnail_url: insertGame.thumbnail_url || null,
      creator: insertGame.creator || null
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(gameId: string, gameUpdate: Partial<InsertGame>): Promise<Game> {
    const existing = this.games.get(gameId);
    if (!existing) throw new Error('Game not found');
    
    const updated: Game = { ...existing, ...gameUpdate };
    this.games.set(gameId, updated);
    return updated;
  }

  async getGameByCreator(creator: string): Promise<Game | undefined> {
    return Array.from(this.games.values())
      .filter(game => game.creator === creator)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    // Check if rating already exists for this session and game
    const existingRating = Array.from(this.ratings.values()).find(
      r => r.session_id === insertRating.session_id && r.game_id === insertRating.game_id
    );

    if (existingRating) {
      // Update existing rating
      const updatedRating: Rating = {
        ...existingRating,
        rating: insertRating.rating,
        ip_address: insertRating.ip_address || existingRating.ip_address,
        user_agent: insertRating.user_agent || existingRating.user_agent,
        updated_at: new Date()
      };
      this.ratings.set(existingRating.id, updatedRating);
      return updatedRating;
    } else {
      // Create new rating
      const id = crypto.randomUUID();
      const rating: Rating = {
        ...insertRating,
        id,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.ratings.set(id, rating);
      return rating;
    }
  }



  async getRatingBySessionAndGame(sessionId: string, gameId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      r => r.session_id === sessionId && r.game_id === gameId
    );
  }

  async getRatingsBySession(sessionId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      r => r.session_id === sessionId
    );
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      r => r.user_id === userId.toString()
    );
  }

  async getRatingByUserAndGame(userId: number, gameId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      r => r.user_id === userId.toString() && r.game_id === gameId
    );
  }

  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<Session> {
    const session: Session = {
      id: sessionId,
      user_id: userId,
      created_at: new Date(),
      expires_at: expiresAt
    };
    // For MemStorage, we'd need a sessions Map, but we're using DatabaseStorage
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    // For MemStorage, we'd check a sessions Map, but we're using DatabaseStorage
    return undefined;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // For MemStorage, we'd delete from sessions Map, but we're using DatabaseStorage
  }
}

import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Make email comparison case-insensitive for mobile compatibility
    const result = await db
      .select()
      .from(users)  
      .where(sql`LOWER(${users.email}) = LOWER(${email})`)
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllGames(): Promise<Array<Game & { avg_rating: number; rating_count: number }>> {
    // Get minimum votes threshold from environment variable (default: 15)
    // Higher threshold makes apps with few votes drop more dramatically
    // Sanitize to ensure it's a positive number to avoid division-by-zero
    const minVotesRaw = parseInt(process.env.LEADERBOARD_MIN_VOTES || '15', 10);
    const minVotes = !isNaN(minVotesRaw) && minVotesRaw >= 1 ? minVotesRaw : 15;
    
    // Calculate global mean rating (C) across all apps
    const globalMeanResult = await db
      .select({
        mean: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`.as('mean')
      })
      .from(ratings);
    
    const globalMean = Number(globalMeanResult[0]?.mean) || 0;
    
    // Fetch all games with their ratings using IMDb weighted rating formula
    // WR = (v/(v+m)) * R + (m/(v+m)) * C
    // Where: R = average rating, v = vote count, C = global mean, m = min votes threshold
    // When v = 0 (no votes), WR = C (global mean)
    const result = await db
      .select({
        id: games.id,
        created_at: games.created_at,
        title: games.title,
        description: games.description,
        thumbnail_url: games.thumbnail_url,
        game_url: games.game_url,
        creator: games.creator,
        submitted_by: games.submitted_by,
        avg_rating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`.as('avg_rating'),
        rating_count: sql<number>`COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END)`.as('rating_count')
      })
      .from(games)
      .leftJoin(ratings, eq(games.id, ratings.game_id))
      .groupBy(games.id)
      .orderBy(
        // Primary sort: Ranking gate - apps with >= minVotes always rank above apps with < minVotes
        desc(sql`CASE WHEN COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END) >= ${minVotes} THEN 1 ELSE 0 END`),
        // Secondary sort: IMDb weighted rating formula
        desc(sql`
          -- WR = (v/(v+m)) * R + (m/(v+m)) * C
          -- When v = 0, this correctly evaluates to C (global mean)
          (
            (CAST(COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END) AS FLOAT) / 
             (CAST(COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END) AS FLOAT) + ${minVotes})) * 
            COALESCE(AVG(${ratings.rating}), 0)
          ) + (
            (${minVotes} / 
             (CAST(COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END) AS FLOAT) + ${minVotes})) * 
            ${globalMean}
          )
        `),
        // Tertiary sort: Tie-breaker by vote count
        desc(sql`COUNT(CASE WHEN ${ratings.id} IS NOT NULL THEN 1 END)`)
      );

    return result.map(row => ({
      ...row,
      avg_rating: Number(row.avg_rating) || 0,
      rating_count: Number(row.rating_count) || 0,
    }));
  }

  async getAllPublicGames(): Promise<Array<Pick<Game, 'id' | 'title' | 'description' | 'thumbnail_url' | 'creator' | 'created_at'>>> {
    const result = await db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        thumbnail_url: games.thumbnail_url,
        creator: games.creator,
        created_at: games.created_at
      })
      .from(games)
      .orderBy(desc(games.created_at));
    
    return result;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
    return result[0];
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const result = await db.insert(games).values(insertGame).returning();
    return result[0];
  }

  async updateGame(gameId: string, gameUpdate: Partial<InsertGame>): Promise<Game> {
    const result = await db
      .update(games)
      .set(gameUpdate)
      .where(eq(games.id, gameId))
      .returning();
    return result[0];
  }

  async getGameByCreator(creator: string): Promise<Game | undefined> {
    const result = await db
      .select()
      .from(games)
      .where(eq(games.creator, creator))
      .orderBy(desc(games.created_at))
      .limit(1);
    return result[0];
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    // Try to find existing rating
    const existingRating = await this.getRatingBySessionAndGame(insertRating.session_id, insertRating.game_id);
    
    if (existingRating) {
      // Update existing rating with security data
      const result = await db
        .update(ratings)
        .set({ 
          rating: insertRating.rating,
          ip_address: insertRating.ip_address,
          user_agent: insertRating.user_agent,
          updated_at: sql`NOW()` 
        })
        .where(eq(ratings.id, existingRating.id))
        .returning();
      return result[0];
    } else {
      // Create new rating with proper timestamps
      const result = await db.insert(ratings).values(insertRating).returning();
      return result[0];
    }
  }



  async getRatingBySessionAndGame(sessionId: string, gameId: string): Promise<Rating | undefined> {
    const result = await db
      .select()
      .from(ratings)
      .where(and(
        eq(ratings.session_id, sessionId),
        eq(ratings.game_id, gameId)
      ))
      .limit(1);
    return result[0];
  }

  async getRatingsBySession(sessionId: string): Promise<Rating[]> {
    const result = await db
      .select()
      .from(ratings)
      .where(eq(ratings.session_id, sessionId));
    return result;
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    const result = await db
      .select()
      .from(ratings)
      .where(eq(ratings.user_id, userId.toString()));
    return result;
  }

  async getRatingByUserAndGame(userId: number, gameId: string): Promise<Rating | undefined> {
    const result = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.user_id, userId.toString()), eq(ratings.game_id, gameId)))
      .limit(1);
    return result[0];
  }

  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<Session> {
    const result = await db
      .insert(sessions)
      .values({ id: sessionId, user_id: userId, expires_at: expiresAt })
      .returning();
    return result[0];
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    return result[0];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

export const storage = new DatabaseStorage();
