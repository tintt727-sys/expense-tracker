import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Categories
  const defaultCategories = [
    { name: 'Food', icon: 'Utensils', type: 'expense' },
    { name: 'Transport', icon: 'Car', type: 'expense' },
    { name: 'Shopping', icon: 'ShoppingBag', type: 'expense' },
    { name: 'Bills', icon: 'FileText', type: 'expense' },
    { name: 'Salary', icon: 'Briefcase', type: 'income' },
    { name: 'Business', icon: 'TrendingUp', type: 'income' },
    { name: 'Entertainment', icon: 'Film', type: 'expense' },
    { name: 'Other', icon: 'MoreHorizontal', type: 'expense' },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  // 2. Seed Default Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: adminPasswordHash
      }
    });
    console.log('Admin created: username: admin / pass: admin123');
  }

  // 3. Seed Demo User
  const userPasswordHash = await bcrypt.hash('user123', 10);
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@expensetracker.pro' }
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: 'demo@expensetracker.pro',
        password: userPasswordHash,
        role: 'user'
      }
    });
    console.log('Demo user created: demo@expensetracker.pro / pass: user123');
  }

  // 4. Seed Realistic Transactions for Demo User
  const txCount = await prisma.transaction.count({
    where: { userId: demoUser.id }
  });

  if (txCount === 0) {
    const sampleTransactions = [
      {
        userId: demoUser.id,
        type: 'income',
        amount: 2500000,
        description: 'Monthly Salary Deposit',
        category: 'Salary',
        date: '2026-10-01',
        paymentMethod: 'Bank'
      },
      {
        userId: demoUser.id,
        type: 'income',
        amount: 450000,
        description: 'Freelance Design Project',
        category: 'Business',
        date: '2026-09-28',
        paymentMethod: 'Mobile Payment'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 120000,
        description: 'City Mart Groceries',
        category: 'Food',
        date: '2026-10-02',
        paymentMethod: 'Card'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 45000,
        description: 'Grab Taxi Rides',
        category: 'Transport',
        date: '2026-10-01',
        paymentMethod: 'Mobile Payment'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 85000,
        description: 'Fiber Internet & Electric Bill',
        category: 'Bills',
        date: '2026-09-29',
        paymentMethod: 'Bank'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 165000,
        description: 'Weekend Shopping & Outfits',
        category: 'Shopping',
        date: '2026-09-27',
        paymentMethod: 'Card'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 35000,
        description: 'Cinema Tickets & Snacks',
        category: 'Entertainment',
        date: '2026-09-26',
        paymentMethod: 'Cash'
      },
      {
        userId: demoUser.id,
        type: 'expense',
        amount: 25000,
        description: 'Coffee & Books',
        category: 'Other',
        date: '2026-09-25',
        paymentMethod: 'Cash'
      }
    ];

    for (const t of sampleTransactions) {
      await prisma.transaction.create({ data: t });
    }
    console.log('Sample transactions seeded.');
  }

  // 5. Seed App Settings
  const defaultSettings = [
    { key: 'currency', value: 'MMK' },
    { key: 'theme', value: 'light' },
    { key: 'appName', value: 'Expense Tracker Pro' },
    { key: 'allowRegistration', value: 'true' }
  ];

  for (const s of defaultSettings) {
    const existing = await prisma.appSetting.findUnique({
      where: { key: s.key }
    });
    if (!existing) {
      await prisma.appSetting.create({ data: s });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
