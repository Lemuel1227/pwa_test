import passport from 'passport';
import User from '../models/User.js';

const sanitizeUser = (user) => user?.toSafeJSON?.() ?? null;

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    const user = await User.create({ username, email, password, provider: 'local' });

    req.login(user, (err) => {
      if (err) {
        console.error('Auto-login after registration failed:', err);
        return res.status(201).json({ user: sanitizeUser(user), requiresReauth: true });
      }
      return res.status(201).json({ user: sanitizeUser(user) });
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    if (error?.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({ error: messages[0] || 'Invalid registration data.' });
    }

    console.error('Registration failed:', error);
    return res.status(500).json({
      error: 'Failed to register user.',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info?.message ?? 'Invalid credentials.' });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.json({ user: sanitizeUser(user) });
    });
  })(req, res, next);
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session?.destroy?.(() => {
      res.clearCookie(process.env.SESSION_COOKIE_NAME || 'sid');
      return res.status(204).send();
    });
  });
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  return res.json({ user: sanitizeUser(req.user) });
};

export const googleAuth = (...args) => {
  if (!passport._strategy('google')) {
    return args[1].status(503).json({ error: 'Google authentication not configured.' });
  }
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(...args);
};

const getClientRedirectBase = () => {
  const configured = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
  const fallback = 'http://localhost:4173';
  if (configured.length > 0) {
    return configured[0];
  }
  return fallback;
};

export const googleCallback = (req, res, next) => {
  const clientBase = getClientRedirectBase();

  if (!passport._strategy('google')) {
    return res.redirect(`${clientBase}/login?error=no-oauth`);
  }

  passport.authenticate('google', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(`${clientBase}/login?error=oauth`);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect(`${clientBase}/dashboard`);
    });
  })(req, res, next);
};
