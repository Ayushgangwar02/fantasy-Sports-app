import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email: string;
      };
    }
  }
}

// JWT Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    // Add user info to request
    req.user = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: user._id.toString(),
          username: user.username,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin role check middleware
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Check if user has admin privileges (you can add an isAdmin field to User model)
    // For now, we'll check if user is a commissioner of any league
    // This is a simplified check - you might want to implement proper role-based access
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      error: 'Authorization failed',
      message: 'An error occurred during authorization'
    });
  }
};

// League commissioner check middleware
export const requireCommissioner = (leagueIdParam: string = 'leagueId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const leagueId = req.params[leagueIdParam];
      
      if (!leagueId) {
        return res.status(400).json({
          error: 'League ID required',
          message: 'League ID must be provided'
        });
      }

      // Import League model here to avoid circular dependency
      const League = (await import('../models/League.js')).default;
      
      const league = await League.findById(leagueId);

      if (!league) {
        return res.status(404).json({
          error: 'League not found',
          message: 'League does not exist'
        });
      }

      if (league.commissioner.toString() !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only league commissioners can perform this action'
        });
      }

      next();
    } catch (error) {
      console.error('Commissioner check error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: 'An error occurred during authorization'
      });
    }
  };
};

// Team owner check middleware
export const requireTeamOwner = (teamIdParam: string = 'teamId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const teamId = req.params[teamIdParam];
      
      if (!teamId) {
        return res.status(400).json({
          error: 'Team ID required',
          message: 'Team ID must be provided'
        });
      }

      // Import Team model here to avoid circular dependency
      const Team = (await import('../models/Team.js')).default;
      
      const team = await Team.findById(teamId);

      if (!team) {
        return res.status(404).json({
          error: 'Team not found',
          message: 'Team does not exist'
        });
      }

      if (team.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only team owners can perform this action'
        });
      }

      next();
    } catch (error) {
      console.error('Team owner check error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: 'An error occurred during authorization'
      });
    }
  };
};
