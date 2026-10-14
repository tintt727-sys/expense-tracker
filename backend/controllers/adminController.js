import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_secret_jwt_key_2026';

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      ADMIN_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      message: 'Admin authorization granted.',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during admin authentication.' });
  }
};

// Admin Dashboard Stats & System Overview
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [userCount, transactionCount, categoryCount, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.category.count(),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } }
      })
    ]);

    const aggregates = await prisma.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      _count: { id: true }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    aggregates.forEach((agg) => {
      if (agg.type === 'income') totalIncome = agg._sum.amount || 0;
      if (agg.type === 'expense') totalExpense = agg._sum.amount || 0;
    });

    return res.json({
      metrics: {
        totalUsers: userCount,
        totalTransactions: transactionCount,
        totalCategories: categoryCount,
        systemIncome: totalIncome,
        systemExpense: totalExpense,
        netFlow: totalIncome - totalExpense
      },
      recentSystemTransactions: transactions
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch admin stats.' });
  }
};

// Admin: View all transactions with user info
export const getAllTransactions = async (req, res) => {
  try {
    const { search, type, category, startDate, endDate, page = 1, limit = 50 } = req.query;

    const where = {
      ...(type && type !== 'all' ? { type } : {}),
      ...(category && category !== 'all' ? { category } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {})
            }
          }
        : {})
    };

    if (search && search.trim()) {
      where.OR = [
        { description: { contains: search.trim() } },
        { category: { contains: search.trim() } },
        { user: { name: { contains: search.trim() } } },
        { user: { email: { contains: search.trim() } } }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        take: parseInt(limit, 10),
        include: { user: { select: { id: true, name: true, email: true } } }
      }),
      prisma.transaction.count({ where })
    ]);

    return res.json({ transactions, total, page: parseInt(page, 10) });
  } catch (error) {
    console.error('Admin getAllTransactions error:', error);
    return res.status(500).json({ message: 'Error fetching transactions.' });
  }
};

// Admin: Update any transaction
export const adminUpdateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date, paymentMethod } = req.body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type ? { type: type.toLowerCase() } : {}),
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(date !== undefined ? { date } : {}),
        ...(paymentMethod !== undefined ? { paymentMethod } : {})
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return res.json({ message: 'Transaction updated by administrator.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update transaction.' });
  }
};

// Admin: Delete any transaction
export const adminDeleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({ where: { id } });
    return res.json({ message: 'Transaction removed from system.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete transaction.' });
  }
};

// Database Control: Backup full database to JSON
export const backupDatabase = async (req, res) => {
  try {
    const [users, transactions, categories, settings] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.transaction.findMany(),
      prisma.category.findMany(),
      prisma.appSetting.findMany()
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      system: 'Expense Tracker Pro',
      stats: {
        usersCount: users.length,
        transactionsCount: transactions.length,
        categoriesCount: categories.length
      },
      data: {
        users,
        transactions,
        categories,
        settings
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-expense-tracker-${Date.now()}.json"`);
    return res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ message: 'Database backup creation failed.' });
  }
};

// Database Control: Reset transactions or reseed
export const resetDatabase = async (req, res) => {
  try {
    const { confirmation, preserveUsers } = req.body;

    if (confirmation !== 'CONFIRM_RESET') {
      return res.status(400).json({
        message: 'Invalid confirmation token. Type "CONFIRM_RESET" to proceed.'
      });
    }

    // Delete transactions
    const deletedTx = await prisma.transaction.deleteMany();

    if (!preserveUsers) {
      // Clear non-admin users if requested
      await prisma.user.deleteMany({
        where: { email: { not: 'demo@expensetracker.pro' } }
      });
    }

    return res.json({
      message: `Database reset completed. Cleared ${deletedTx.count} transactions.`,
      resetAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ message: 'Database reset operation failed.' });
  }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current admin password incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    return res.json({ message: 'Admin password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update admin password.' });
  }
};
