import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { attachUser } from './middleware/auth.js';

const app = express();

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
const mongoUri = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
}

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Blocked CORS origin: ${origin}`);
      }

      return callback(new Error('Not allowed by CORS')); // eslint-disable-line unicorn/error-message
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || 'sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 24 * 7),
    },
    store: MongoStore.create({
      mongoUrl: mongoUri,
      dbName: process.env.MONGO_DB_NAME || undefined,
      collectionName: 'sessions',
      ttl: Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7),
      stringify: false,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(attachUser);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  return res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
  });
});

export default app;
