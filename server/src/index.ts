import express from 'express';
import cors from 'cors';
import { env } from './lib/env';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { mailRouter } from './routes/mail';

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.send('Box API is running 🚀'));
app.use('/auth', authRouter);
app.use('/mail', mailRouter);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});