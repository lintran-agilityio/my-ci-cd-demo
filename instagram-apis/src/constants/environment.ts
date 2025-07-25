// libs
import 'dotenv/config';

export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';

export const isTestEnvironment = process.env.NODE_ENV === 'test';
