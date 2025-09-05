import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { setCache, getCache, delCache } from '../utils/cache.js';
import mailer from '../utils/mailer.js';

const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', data: errors.array() });
  try {
  // Only admin can register new users via this endpoint
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can register users' });

  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
  const user = await User.create({ email, password, role });
  return res.status(201).json({ success: true, message: 'User registered', data: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const access = generateAccessToken(user._id);
  const refresh = generateRefreshToken(user._id);
  user.refreshToken = refresh;
  await user.save();
  return res.json({ success: true, message: 'Logged in', data: { accessToken: access, refreshToken: refresh } });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const cacheKey = `user:${req.user._id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ success: true, message: 'User profile (cached)', data: cached });
    const user = await User.findById(req.user._id).select('-password');
    setCache(cacheKey, user, 5 * 60 * 1000); // 5 minutes
    return res.json({ success: true, message: 'User profile', data: user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ success: false, message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const exp = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;
    await TokenBlacklist.create({ token, expiresAt: exp });
    // Also clear refresh token from user if present
    if (req.user) {
      const u = await User.findById(req.user._id);
      if (u) {
        u.refreshToken = null;
        await u.save();
        delCache(`user:${u._id}`);
      }
    }
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    const access = generateAccessToken(user._id);
    return res.json({ success: true, message: 'Token refreshed', data: { accessToken: access } });
  } catch (err) {
    next(err);
  }
};

export const sendWelcomeEmail = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can send welcome emails' });

    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    if (!mailer.isConfigured()) return res.status(500).json({ success: false, message: 'Mailer not configured on server' });

    const html = `<p>Hi ${name || ''},</p><p>Your account has been created. Use the credentials below to sign in:</p><ul><li>Email: ${email}</li><li>Password: ${password}</li></ul><p>Please change your password after first login.</p>`;
    await mailer.sendMail({ to: email, subject: 'Welcome to CMIS', html, text: `Your account: ${email} / ${password}` });
    return res.json({ success: true, message: 'Welcome email sent' });
  } catch (err) {
    next(err);
  }
};
