import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameSchema, insertRatingSchema } from "@shared/schema";
import { signup, login, logout, getCurrentUser, requireAuth } from "./auth";
import cookieParser from "cookie-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cookie parser middleware
  app.use(cookieParser());

  // Auth routes with request logging
  app.post("/api/auth/signup", (req, res, next) => {
    console.log('🟢 SIGNUP REQUEST RECEIVED:', { email: req.body.email, userAgent: req.get('User-Agent') });
    next();
  }, signup);
  
  app.post("/api/auth/login", (req, res, next) => {
    console.log('🟢 LOGIN REQUEST RECEIVED:', { 
      email: req.body.email, 
      userAgent: req.get('User-Agent'),
      host: req.get('Host'),
      origin: req.get('Origin'),
      referer: req.get('Referer')
    });
    next();
  }, login);
  
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/user", getCurrentUser);
  
  // Mobile connectivity test endpoint
  app.get('/api/mobile-test', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    console.log('=== MOBILE TEST ENDPOINT HIT ===');
    console.log('User Agent:', userAgent);
    console.log('Is mobile:', isMobile);
    console.log('Client IP:', req.ip);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    res.json({ 
      success: true, 
      isMobile, 
      userAgent,
      timestamp: new Date().toISOString(),
      serverWorking: true
    });
  });

  // Add a simple POST test endpoint for mobile debugging
  app.post('/api/mobile-login-test', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    console.log('=== MOBILE LOGIN TEST ENDPOINT HIT ===');
    console.log('Body received:', req.body);
    console.log('User Agent:', userAgent);
    console.log('Is mobile:', isMobile);
    res.json({ 
      received: req.body,
      isMobile, 
      userAgent,
      message: 'Test endpoint working'
    });
  });

  // Public API route for cross-origin access to all apps
  app.get("/api/public-apps", async (req, res) => {
    try {
      // Enable CORS for public access
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      const games = await storage.getAllPublicGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching public apps:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Games routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      
      // Add submitted_by tracking from session/auth if available
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      const gameWithSubmitter = { 
        ...gameData, 
        submitted_by: sessionId 
      };
      
      // Create new game (allow unlimited uploads per creator)
      const game = await storage.createGame(gameWithSubmitter);
      console.log(`Created new app for creator: ${gameData.creator}`);
      
      // Broadcast new app notification to all connected WebSocket clients
      const wss = (app as any).wss as WebSocketServer;
      if (wss) {
        const notification = {
          type: 'new_app',
          data: {
            creator: game.creator,
            title: game.title,
            thumbnail_url: game.thumbnail_url,
            id: game.id
          }
        };
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
          }
        });
      }
      
      // Return the game with rating info for consistency
      const gameWithRatings = { ...game, avg_rating: 0, rating_count: 0 };
      res.status(201).json({
        ...gameWithRatings,
        message: "App created successfully"
      });
    } catch (error) {
      console.error("Error creating game:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid game data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create game" });
      }
    }
  });

  // Rate limiting middleware
  const ratingLimiter = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_RATINGS_PER_WINDOW = 10; // Max 10 ratings per minute per IP

  // Security middleware for rating protection
  const validateRatingRequest = async (req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Rate limiting check
    const limitKey = clientIP;
    const limit = ratingLimiter.get(limitKey);
    
    if (limit) {
      if (now > limit.resetTime) {
        // Reset window
        ratingLimiter.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else if (limit.count >= MAX_RATINGS_PER_WINDOW) {
        console.log(`Rate limit exceeded for IP: ${clientIP}`);
        return res.status(429).json({ 
          error: "Too many rating attempts. Please wait before rating again.",
          retryAfter: Math.ceil((limit.resetTime - now) / 1000)
        });
      } else {
        limit.count++;
      }
    } else {
      ratingLimiter.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    next();
  };

  app.post("/api/games/:gameId/rate", validateRatingRequest, async (req, res) => {
    try {
      const { gameId } = req.params;
      const { rating, sessionId } = req.body;
      const userAgent = req.get('User-Agent') || '';
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      
      console.log(`Secure rating request - GameID: ${gameId}, Rating: ${rating}, IP: ${clientIP}`);
      console.log(`Mobile device: ${isMobile}, User-Agent: ${userAgent}`);

      // Validate session ID format (basic check against obvious fakes)
      // Accept UUID format (with hyphens) or simple alphanumeric strings
      if (!sessionId || sessionId.length < 10 || !/^[a-f0-9-_]+$/i.test(sessionId)) {
        console.log('Rating failed: Invalid or suspicious session ID format:', sessionId);
        return res.status(400).json({ error: "Invalid session format" });
      }

      if (!rating || rating < 1 || rating > 5) {
        console.log('Rating failed: Invalid rating value:', rating);
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      // Check if user is authenticated to link rating to user account
      let userId = null;
      const authSessionId = req.cookies.sessionId;
      if (authSessionId) {
        const userSession = await storage.getSession(authSessionId);
        if (userSession && userSession.expires_at > new Date()) {
          userId = userSession.user_id;
          console.log(`Authenticated user rating - User ID: ${userId}`);
        }
      }

      // Check if game exists
      const game = await storage.getGame(gameId);
      if (!game) {
        console.log('Rating failed: Game not found:', gameId);
        return res.status(404).json({ error: "Game not found" });
      }

      // Check if user already has a rating for this game (prioritize user-based lookup for authenticated users)
      let existingRating;
      if (userId) {
        existingRating = await storage.getRatingByUserAndGame(userId, gameId);
      } else {
        existingRating = await storage.getRatingBySessionAndGame(sessionId, gameId);
      }
      let isUpdate = !!existingRating;

      // Security: Prevent competitors from rating games
      // This would require checking user authentication and role
      // For now, we'll implement basic session validation
      if (sessionId.startsWith('competitor_')) {
        console.log('Rating blocked: Competitors cannot vote on games');
        return res.status(403).json({ error: "Competitors cannot vote on games" });
      }

      // Enhanced rating data with security fields and user linkage
      const ratingData = { 
        game_id: gameId, 
        session_id: sessionId, 
        user_id: userId ? userId.toString() : null, // Link to authenticated user
        rating,
        ip_address: clientIP,
        user_agent: userAgent
      };
      
      await storage.createOrUpdateRating(ratingData);
      
      console.log(`Rating ${isUpdate ? 'updated' : 'created'} successfully with security data`);
      res.json({ 
        success: true,
        message: isUpdate ? "Rating updated successfully" : "Rating registered successfully"
      });
    } catch (error) {
      console.error("Error rating game:", error);
      res.status(500).json({ 
        error: "Failed to rate game",
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get user's ratings by session ID (legacy)
  app.get("/api/ratings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const ratings = await storage.getRatingsBySession(sessionId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  // Get authenticated user's ratings
  app.get("/api/user/ratings", async (req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session || session.expires_at < new Date()) {
        return res.status(401).json({ error: "Session expired" });
      }

      const ratings = await storage.getRatingsByUser(session.user_id);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  // Mobile diagnostic endpoint
  app.get("/api/mobile-test", (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    res.json({
      mobile: isMobile,
      userAgent,
      timestamp: new Date().toISOString(),
      cookies: req.cookies,
      headers: req.headers
    });
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for real-time notifications on a specific path
  const wss = new WebSocketServer({ noServer: true });
  
  httpServer.on('upgrade', (request, socket, head) => {
    // Only handle WebSocket upgrades for our notifications path
    if (request.url === '/ws/notifications') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });
  
  wss.on('connection', (ws) => {
    console.log('New notification WebSocket client connected');
    
    ws.on('error', (error) => {
      console.error('Notification WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('Notification WebSocket client disconnected');
    });
  });

  // Store WebSocket server on app for broadcasting
  (app as any).wss = wss;

  return httpServer;
}
