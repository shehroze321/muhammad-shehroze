import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { UnauthorizedError } from '../errors';
import { AuthRequest } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};


export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
 
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
        };
      } catch (err) {
      }
    }

    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId && !req.user) {
      req.sessionId = sessionId;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuthOrSession = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
        };
        return next();
      } catch (err) {
      }
    }

    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      req.sessionId = sessionId;
      return next();
    }

    throw new UnauthorizedError('Authentication required. Provide JWT token or session ID.');
  } catch (error) {
    next(error);
  }
};

