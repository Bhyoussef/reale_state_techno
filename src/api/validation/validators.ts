export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

export function assertRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} is required.`);
  }

  return value.trim();
}

export function assertEmail(value: unknown, field = 'email'): string {
  const email = assertRequiredString(value, field).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid ${field} format.`);
  }

  return email;
}

export function assertMinLength(value: string, min: number, field: string): string {
  if (value.length < min) {
    throw new ValidationError(`${field} must be at least ${min} characters.`);
  }

  return value;
}

export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, '');
}
