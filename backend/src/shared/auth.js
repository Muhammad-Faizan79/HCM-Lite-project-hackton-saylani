import jwt from 'jsonwebtoken';
import User from '../modules/auth/User.js';
export async function protect(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Login required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-only-change-me');
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user || !user.active) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user; next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
export const allow = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Not allowed for this role' });
