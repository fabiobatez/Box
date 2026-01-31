import { env } from '../lib/env';

describe('env', () => {
  it('loads defaults for dev', () => {
    expect(env.PORT).toBeGreaterThan(0);
    expect(typeof env.CORS_ORIGIN).toBe('string');
  });
});