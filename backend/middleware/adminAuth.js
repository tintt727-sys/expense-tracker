import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin access required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_SECRET || 'admin_secret_jwt_key_2026';

    const decoded = jwt.verify(token, secret);
    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found or expired.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired admin session token.' });
  }
};
