import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Use a secure secret from environment or fallback for local dev
const JWT_SECRET = process.env.JWT_SECRET || 'shrigonda-news-secret-2025';

/**
 * Hash password securely
 */
export function hashPassword(password) {
  if (!password) throw new Error('Password required');
  return bcrypt.hashSync(password, 10);
}

/**
 * Compare password with hash
 * Returns true if matches, false otherwise
 */
export function comparePassword(password, hash) {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error('comparePassword error:', err);
    return false;
  }
}

/**
 * Generate JWT for a user
 */
export function generateToken(user) {
  if (!user) throw new Error('User payload required');

  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role || 'editor'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT and return decoded payload
 */
export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('verifyToken error:', error.message);
    return null;
  }
}

/**
 * Extract Bearer token from request headers
 */
export function extractToken(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}
