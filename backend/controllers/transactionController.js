import prisma from '../models/prismaClient.js';

// Get transactions for the authenticated user with search, filter, and sorting
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      sortBy = 'date', // 'date' | 'amount'
      sortOrder = 'desc', // 'desc' | 'asc'
      limit
    } = req.query;

    const where = {
      userId,
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
      const q = search.trim();
      const numQ = parseFloat(q);
      const isNum = !isNaN(numQ);

      where.OR = [
        { description: { contains: q } },
        { category: { contains: q } },
        { paymentMethod: { contains: q } },
        ...(isNum ? [{ amount: { equals: numQ } }] : [])
      ];
    }

    const orderBy = {};
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.date = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [orderBy, { createdAt: 'desc' }],
      ...(limit ? { take: parseInt(limit, 10) } : {})
    });

    return res.json({ transactions, count: transactions.length });
  } catch (error) {
    console.error('getTransactions error:', error);
    return res.status(500).json({ message: 'Error retrieving transactions.' });
  }
};

// Get Dashboard Analytics & Summaries
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const allUserTx = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryBreakdown = {};
    const monthlyDataMap = {};

    allUserTx.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpense += amt;

        // Group by category for donut chart
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + amt;
      }

      // Group by Month (YYYY-MM) for Income vs Expense bar chart
      const monthKey = tx.date.slice(0, 7); // e.g. "2026-10"
      if (!monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        monthlyDataMap[monthKey].income += amt;
      } else {
        monthlyDataMap[monthKey].expense += amt;
      }
    });

    const totalBalance = totalIncome - totalExpense;

    // Monthly Chart Array (sorted chronologically)
    const monthlyChart = Object.values(monthlyDataMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Donut chart formatted array
    const categoryChart = Object.keys(categoryBreakdown).map((name) => ({
      name,
      amount: categoryBreakdown[name]
    })).sort((a, b) => b.amount - a.amount);

    // Latest 10 transactions
    const recentTransactions = allUserTx.slice(0, 10);

    return res.json({
      summary: {
        totalBalance,
        totalIncome,
        totalExpense,
        remainingBalance: totalBalance,
        transactionCount: allUserTx.length
      },
      charts: {
        monthlyChart,
        categoryChart
      },
      recentTransactions
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    return res.status(500).json({ message: 'Error calculating dashboard summaries.' });
  }
};

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, description, category, date, paymentMethod } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: 'Missing required transaction fields.' });
    }

    if (!['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const validMethods = ['Cash', 'Bank', 'Card', 'Mobile Payment'];
    const resolvedMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'Cash';

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: type.toLowerCase(),
        amount: numAmount,
        description: description ? description.trim() : '',
        category: category.trim(),
        date,
        paymentMethod: resolvedMethod
      }
    });

    return res.status(201).json({
      message: 'Transaction saved successfully.',
      transaction
    });
  } catch (error) {
    console.error('createTransaction error:', error);
    return res.status(500).json({ message: 'Failed to create transaction.' });
  }
};

// Update an existing transaction
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, amount, description, category, date, paymentMethod } = req.body;

    const existing = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (existing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to modify this transaction.' });
    }

    const updateData = {};
    if (type) {
      if (!['income', 'expense'].includes(type.toLowerCase())) {
        return res.status(400).json({ message: 'Type must be income or expense.' });
      }
      updateData.type = type.toLowerCase();
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number.' });
      }
      updateData.amount = numAmount;
    }

    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (date !== undefined) updateData.date = date;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    return res.json({
      message: 'Transaction updated successfully.',
      transaction: updated
    });
  } catch (error) {
    console.error('updateTransaction error:', error);
    return res.status(500).json({ message: 'Failed to update transaction.' });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (existing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this transaction.' });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    return res.status(500).json({ message: 'Failed to delete transaction.' });
  }
};

// Export user transactions to CSV
export const exportCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    });

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description', 'Created At'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.createdAt.toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expense-tracker-transactions.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportCSV error:', error);
    return res.status(500).json({ message: 'Failed to export CSV.' });
  }
};
