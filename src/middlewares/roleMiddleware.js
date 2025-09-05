const permit = (...allowed) => (req, res, next) => {
  const { user } = req;
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (allowed.includes(user.role)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
};

export default permit;
