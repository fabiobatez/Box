# Box Middleware

Express + TypeScript middleware providing:
- OAuth 2.0 (Google) login with PKCE
- Mail endpoints: list messages, get message, send message (Gmail)
- Simple in-memory token store (replace with DB for production)

## Setup
1. Copy `.env.example` to `.env` and set values:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URL`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (default on `http://localhost:4000`)

## Endpoints
- `GET /health` — health check
- `GET /auth/google/login` — returns `{ url }` to redirect user for OAuth
- `GET /auth/google/callback` — handles OAuth callback, stores tokens
- `GET /mail/messages?userId=email` — list recent messages
- `GET /mail/messages/:id?userId=email` — message details
- `POST /mail/send` — send message `{ to, subject, body, userId }`

## Notes
- Tokens are stored in memory per `userId` (email). For production, use a database and encrypt tokens.
- CORS origin defaults to `http://localhost:5173` (Vite dev server).
- Unit tests are under `src/__tests__` and run with `npm test`.