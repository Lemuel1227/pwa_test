export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated?.() && req.user) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required.' });
};

export const attachUser = (req, res, next) => {
  res.locals.user = req.user ?? null;
  next();
};
