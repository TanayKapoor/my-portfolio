import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Try to use PostgreSQL store, fall back to memory store if it fails
  let sessionStore;
  try {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    // Add error handling for session store
    sessionStore.on('error', (error) => {
      console.error('Session store error:', error);
    });
    
    console.log('Using PostgreSQL session store');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL session store, using MemoryStore:', error);
    sessionStore = undefined; // This will use default memory store
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    name: 'connect.sid',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Initialize session first
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add session debugging middleware after session initialization
  app.use((req, res, next) => {
    if (req.url.includes('/api/auth')) {
      console.log("Session debug:", {
        url: req.url,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        user: req.user ? 'present' : 'none',
        cookies: req.headers.cookie
      });
    }
    next();
  });

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  console.log("Auth check:", {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!user,
    hasExpiresAt: !!user?.expires_at,
    expires_at: user?.expires_at,
    now: Math.floor(Date.now() / 1000)
  });

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log("No refresh token available");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    console.log("Attempting token refresh");
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log("Token refreshed successfully");
    return next();
  } catch (error) {
    console.log("Token refresh failed:", error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Admin-only middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = user.claims.sub;
    const dbUser = await storage.getUser(userId);
    
    if (!dbUser || !dbUser.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    return next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Failed to verify admin status" });
  }
};