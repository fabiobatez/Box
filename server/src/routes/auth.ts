import express from 'express';
import { env } from '../lib/env';
import { google } from 'googleapis';
import { tokenStore } from '../lib/store';

export const authRouter = express.Router();

// Discover Google OAuth endpoints
function getOAuth2Client() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth non configuré: définissez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET');
  }
  const oAuth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.OAUTH_REDIRECT_URL
  );
  return oAuth2Client;
}

authRouter.get('/google/login', async (_req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      // Optionnels mais utiles si on étend les fonctionnalités plus tard
      // 'https://www.googleapis.com/auth/gmail.compose',
      // 'https://www.googleapis.com/auth/gmail.modify',
      'openid',
      'email',
      'profile',
    ];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: scopes,
      prompt: 'consent',
      response_type: 'code',
    });
    // Redirect user agent directly to Google instead of returning JSON
    res.redirect(authUrl);
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || 'Failed to initiate Google OAuth';
    const isConfig = msg.includes('Google OAuth non configuré');
    res.status(isConfig ? 400 : 500).json({ error: msg });
  }
});

// Minimal scopes login to diagnose 400 errors from Google
authRouter.get('/google/login-basic', async (_req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const scopes = ['openid', 'email', 'profile'];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      response_type: 'code',
    });
    res.redirect(authUrl);
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || 'Failed to initiate Google OAuth';
    const isConfig = msg.includes('Google OAuth non configuré');
    res.status(isConfig ? 400 : 500).json({ error: msg });
  }
});

authRouter.get('/google/callback', async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const code = req.query.code as string | undefined;
    if (!code) return res.status(400).json({ error: 'Missing code' });
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2('v2');
    const me = await oauth2.userinfo.get({ auth: oauth2Client });
    const userEmail = me.data.email || 'demo-user';

    tokenStore.set(userEmail, {
      provider: 'google',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: undefined,
    });

    const url = new URL(env.CORS_ORIGIN);
    url.searchParams.set('user', userEmail);
    res.redirect(url.toString());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

authRouter.post('/logout', (req, res) => {
  const userId = req.body?.userId || 'demo-user';
  tokenStore.delete(userId);
  res.json({ ok: true });
});
// Convenience redirect: /auth/google -> /auth/google/login
authRouter.get('/google', (_req, res) => {
  res.redirect('/auth/google/login');
});