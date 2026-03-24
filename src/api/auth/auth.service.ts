import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { DatabaseClient } from '../properties';
import { UserRole } from '../../models';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: Extract<UserRole, 'agent' | 'user'>;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceName?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: 'Bearer';
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

const TOKEN_TTL_DAYS = 30;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, savedHash] = hashedPassword.split(':');
  if (!salt || !savedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const savedKey = Buffer.from(savedHash, 'hex');

  if (derivedKey.length !== savedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, savedKey);
}

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

function generateSanctumToken(userId: string): { plainTextToken: string; tokenHash: string } {
  const rawToken = randomBytes(40).toString('hex');
  return {
    plainTextToken: `${userId}|${rawToken}`,
    tokenHash: hashToken(rawToken),
  };
}

export class AuthService {
  constructor(private readonly db: DatabaseClient) {}

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const role: UserRole = payload.role ?? 'user';

    const insertSql = `
      INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
      VALUES ($1, LOWER($2), $3, $4, $5, TRUE)
      RETURNING
        id,
        full_name AS "fullName",
        email,
        role,
        password_hash AS "passwordHash"
    `;

    const passwordHash = hashPassword(payload.password);
    const result = await this.db.query<UserRow>(insertSql, [
      payload.fullName,
      payload.email,
      payload.phone ?? null,
      passwordHash,
      role,
    ]);

    const user = result.rows[0];
    const token = await this.createToken(user.id, 'register-token');

    return {
      token,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const userSql = `
      SELECT
        id,
        full_name AS "fullName",
        email,
        role,
        password_hash AS "passwordHash"
      FROM users
      WHERE LOWER(email) = LOWER($1)
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const userResult = await this.db.query<UserRow>(userSql, [payload.email]);
    const user = userResult.rows[0];

    if (!user || !verifyPassword(payload.password, user.passwordHash)) {
      throw new Error('Invalid credentials.');
    }

    const token = await this.createToken(user.id, payload.deviceName ?? 'web-session');

    return {
      token,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    await this.db.query(
      `
      UPDATE personal_access_tokens
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE token = $1
        AND deleted_at IS NULL
      `,
      [tokenHash],
    );
  }

  async getUserFromToken(token: string): Promise<{ id: string; role: UserRole; email: string; fullName: string } | null> {
    const tokenHash = hashToken(token);

    const sql = `
      SELECT
        u.id,
        u.role,
        u.email,
        u.full_name AS "fullName"
      FROM personal_access_tokens pat
      INNER JOIN users u
        ON u.id = pat.tokenable_id
      WHERE pat.token = $1
        AND pat.deleted_at IS NULL
        AND u.deleted_at IS NULL
        AND (pat.expires_at IS NULL OR pat.expires_at > NOW())
      LIMIT 1
    `;

    const result = await this.db.query<{ id: string; role: UserRole; email: string; fullName: string }>(sql, [tokenHash]);
    const user = result.rows[0] ?? null;

    if (user) {
      await this.db.query(
        `
        UPDATE personal_access_tokens
        SET last_used_at = NOW(), updated_at = NOW()
        WHERE token = $1
        `,
        [tokenHash],
      );
    }

    return user;
  }

  private async createToken(userId: string, tokenName: string): Promise<string> {
    const { plainTextToken, tokenHash } = generateSanctumToken(userId);

    await this.db.query(
      `
      INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, expires_at)
      VALUES ('users', $1, $2, $3, $4::jsonb, NOW() + INTERVAL '${TOKEN_TTL_DAYS} days')
      `,
      [userId, tokenName, tokenHash, JSON.stringify(['*'])],
    );

    return plainTextToken;
  }
}
