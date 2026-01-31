import { describe, it, expect } from '@jest/globals';
import { // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} from 'module';
import { normalizeMessage } from '../services/gmail';

describe('gmail normalizeMessage', () => {
  it('extracts headers and body', () => {
    const fake = {
      id: '123',
      threadId: 't1',
      snippet: 'Hello',
      payload: {
        headers: [
          { name: 'From', value: 'box@hogwarts.edu' },
          { name: 'To', value: 'harry@hogwarts.edu' },
          { name: 'Subject', value: 'Welcome' },
          { name: 'Date', value: 'Mon, 1 Apr 2025 10:00:00 +0000' },
        ],
        body: { data: Buffer.from('Body text').toString('base64') },
      },
    };
    const n = normalizeMessage(fake as any);
    expect(n.id).toBe('123');
    expect(n.subject).toBe('Welcome');
    expect(n.body).toContain('Body text');
  });
});