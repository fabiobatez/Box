import { google } from 'googleapis';

function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

export const gmailConnector = {
  async listMessages(accessToken: string, label: string = 'INBOX') {
    const gmail = getGmailClient(accessToken);
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10, q: `label:${label}` });
    const messages = res.data.messages || [];
    // Fetch minimal details
    const items = await Promise.all(
      messages.map(async (m) => {
        const detail = await gmail.users.messages.get({ userId: 'me', id: m.id! });
        return normalizeMessage(detail.data);
      })
    );
    return items;
  },
  async getMessage(accessToken: string, id: string) {
    const gmail = getGmailClient(accessToken);
    const res = await gmail.users.messages.get({ userId: 'me', id });
    return normalizeMessage(res.data);
  },
  async sendMessage(accessToken: string, opts: { to: string; subject: string; body: string }) {
    const gmail = getGmailClient(accessToken);
    const raw = buildRfc822(opts);
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  },
};

export function normalizeMessage(msg: any) {
  const headers = (msg.payload?.headers || []) as Array<{ name: string; value: string }>;
  const find = (n: string) => headers.find((h) => h.name.toLowerCase() === n)?.value || '';
  const bodyPart = msg.payload?.parts?.find((p: any) => p.mimeType === 'text/plain') || msg.payload;
  const bodyData = bodyPart?.body?.data || '';
  const body = base64UrlDecode(bodyData);
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: find('from'),
    to: find('to'),
    subject: find('subject'),
    date: find('date'),
    snippet: msg.snippet,
    body,
  };
}

function buildRfc822({ to, subject, body }: { to: string; subject: string; body: string }) {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ];
  const rfc822 = lines.join('\r\n');
  return base64UrlEncode(rfc822);
}

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(data: string) {
  if (!data) return '';
  const pad = data.length % 4 === 0 ? 0 : 4 - (data.length % 4);
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat(pad);
  return Buffer.from(padded, 'base64').toString('utf-8');
}