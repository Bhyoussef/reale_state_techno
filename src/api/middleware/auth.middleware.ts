import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../../models';
import { AuthService } from '../auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
    fullName: string;
  };
}

function parseBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.includes('|') ? token.split('|')[1] : token;
}

export function authenticate(authService: AuthService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const bearerToken = parseBearerToken(req.header('authorization'));

    if (!bearerToken) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const user = await authService.getUserFromToken(bearerToken);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    req.user = user;
    return next();
  };
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    return next();
  };
}
