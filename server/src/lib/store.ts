import fs from 'fs';
import path from 'path';

// Simple file-based store for demo/dev; replace with DB in production
export type TokenRecord = {
  provider: 'google';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

const DB_FILE = path.join(process.cwd(), 'tokens.json');
const store = new Map<string, TokenRecord>();

// Load from disk on startup
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const json = JSON.parse(data);
    for (const [k, v] of Object.entries(json)) {
      store.set(k, v as TokenRecord);
    }
    console.log(`Loaded ${store.size} sessions from disk.`);
  }
} catch (e) {
  console.error('Failed to load sessions', e);
}

function persist() {
  try {
    const obj = Object.fromEntries(store.entries());
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export const tokenStore = {
  set(userId: string, record: TokenRecord) {
    store.set(userId, record);
    persist();
  },
  get(userId: string) {
    return store.get(userId) || null;
  },
  delete(userId: string) {
    store.delete(userId);
    persist();
  },
};