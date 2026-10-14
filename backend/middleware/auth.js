import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'expense_tracker_pro_super_secret_jwt_key_2026';

    const decoded = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};
