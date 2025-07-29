// libs
import 'dotenv/config';

export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'jwt-referesh-token-secret';
export const EXPIRES_TIME = process.env.JWT_EXPIRED_TIME || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
export const REFRESH_EXPIRES_TIME = process.env.JWT_REFRESH_EXPIRED_TIME || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

export const isTestEnvironment = process.env.NODE_ENV === 'test';
