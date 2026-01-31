import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16).default('dev-secret-change-me'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_REDIRECT_URL: z.string().default('http://localhost:4000/auth/google/callback'),
});

export const env = EnvSchema.parse(process.env);

