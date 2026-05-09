function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function attachUser(req, res, next) {
  req.userId = req.session && req.session.userId ? req.session.userId : null;
  next();
}

module.exports = { requireLogin, attachUser };
