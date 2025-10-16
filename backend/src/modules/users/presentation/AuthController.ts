import { Response, NextFunction } from 'express';
import { AuthService } from '../application/AuthService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.authService.register({ email, password, name });

      const sanitizedUser = this.authService.sanitizeUser(result.user);

      res.status(201).json(
        successResponse({
          user: sanitizedUser,
          requiresEmailVerification: result.requiresEmailVerification,
          message: result.message,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });

      const sanitizedUser = this.authService.sanitizeUser(result.user);

      res.status(200).json(
        successResponse({
          user: sanitizedUser,
          token: result.token,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await this.authService.getProfile(req.user.id);
      const sanitizedUser = this.authService.sanitizeUser(user);

      res.status(200).json(successResponse(sanitizedUser));
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { name } = req.body;

      const user = await this.authService.updateProfile(req.user.id, { name });
      const sanitizedUser = this.authService.sanitizeUser(user);

      res.status(200).json(successResponse(sanitizedUser));
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, otp } = req.body;

      if (!userId || !otp) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'userId and otp are required' }
        });
        return;
      }

      const result = await this.authService.verifyEmail(userId, otp);
      
      
      const sanitizedUser = this.authService.sanitizeUser(result.user);
      
      res.status(200).json(successResponse({
        user: sanitizedUser,
        token: result.token,
        message: result.message,
      }));
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'email is required' }
        });
        return;
      }

      const result = await this.authService.resendVerificationEmail(email);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
  
      res.status(200).json(successResponse({ message: 'Logged out successfully' }));
    } catch (error) {
      next(error);
    }
  };
}

