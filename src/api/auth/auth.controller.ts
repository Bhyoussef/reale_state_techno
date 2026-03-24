import { Request, Response } from 'express';
import { assertEmail, assertMinLength, assertRequiredString, sanitizeText } from '../validation/validators';
import { AuthService } from './auth.service';

function getBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.includes('|') ? token.split('|')[1] : token;
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const fullName = sanitizeText(assertRequiredString(req.body?.fullName, 'fullName'));
    const email = assertEmail(req.body?.email);
    const password = assertMinLength(assertRequiredString(req.body?.password, 'password'), 8, 'password');
    const phone = typeof req.body?.phone === 'string' ? sanitizeText(req.body.phone) : undefined;
    const role = req.body?.role;

    const response = await this.authService.register({
      fullName,
      email,
      password,
      phone,
      role,
    });

    return res.status(201).json({
      success: true,
      ...response,
    });
  };

  login = async (req: Request, res: Response) => {
    const email = assertEmail(req.body?.email);
    const password = assertRequiredString(req.body?.password, 'password');
    const deviceName = typeof req.body?.deviceName === 'string' ? sanitizeText(req.body.deviceName) : undefined;

    const response = await this.authService.login({
      email,
      password,
      deviceName,
    });

    return res.status(200).json({
      success: true,
      ...response,
    });
  };

  logout = async (req: Request, res: Response) => {
    const bearerToken = getBearerToken(req.header('authorization'));

    if (!bearerToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    await this.authService.logout(bearerToken);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  };
}
